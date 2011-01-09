<?php

class Controller_Cron extends Controller_Default {

	protected $resourcesTemplateArray;
	protected $resourcesNames;
	protected $options;

	public function before() {
		parent::before();

		$this->resourcesTemplateArray = (array) Kohana::config('resources');
		$this->resourcesNames = array_keys($this->resourcesTemplateArray);
		$this->options = Kohana::config('options');
	}

	public function action_cycle() {
		$lastcron = ORM::factory('option')->where('name', '=', 'lastcron')->find();
		$lastSettlersEat = ORM::factory('option')->where('name', '=', 'lastSettlersEat')->find();

		if (time() < $lastcron->value + $this->options->cronInterval) {
			die('Request made to soon');
		}

		if (time() < $lastSettlersEat->value + $this->options->foodSettlerInterval) {
			$settlersCanEat = FALSE;
		} else {
			$settlersCanEat = TRUE;
			$lastSettlersEat->value = time();
			$lastSettlersEat->save();
		}

		$provinces = ORM::factory('province')->find_all();

		foreach ($provinces as $province) {
			$this->debug('Going through province ' . $province->id);
			$this->cycleProvince($province, $settlersCanEat);
		}

		// Remove old messages (more than a week)
		DB::delete('infos')->where('date', '<', time() - 604800)->execute();

		$lastcron->value = time();
		$lastcron->save();
		die('Succeed');
	}

	protected function cycleProvince($province, $settlersCanEat) {
		$counts = $maxes = $this->resourcesTemplateArray;
		foreach ($this->resourcesNames as $resource) {
			$counts[$resource] = $province->{$resource . '_count'};
		}

		// We need to compute the general maxes for the province
		foreach($province->buildings->find_all() as $building) {
			if ($building) {
				foreach ($this->resourcesNames as $resource) {
					$maxes[$resource] += $building->buildingstat->{$resource . '_max'};
				}
			}
		}

		// Feed the settlers
		if ($province->user_id != NULL && $settlersCanEat) {
			$foodEatenBySettlers = (int)($counts['settlers'] * $this->options->foodBySettler);
			if ($counts['food'] < $foodEatenBySettlers) {
				// Not enough food, some settlers eat, some go away
				$settlersThatEat = (int)($counts['food'] / $this->options->foodBySettler);
				$settlersThatGo = $counts['settlers'] - $settlersThatEat;
				$counts['food'] = 0;
				$counts['settlers'] -= $settlersThatGo;
				Utils::addInfo($province->user, '[settlers-eat] Province ' . $province->name . ' lost ' . $settlersThatGo . ' settlers because they had nothing to eat!');
				$this->debug('Nothing to eat, ' . $settlersThatGo . ' settlers gone.');
			} else {
				$counts['food'] -= $foodEatenBySettlers;
				$this->debug('Settlers ate ' . $foodEatenBySettlers . ' food.');
			}
		}

		foreach ($province->buildings->find_all() as $building) {
			if (!$building) {
				continue;
			}

			// NOTE: There never should be any buildings on unowned (fresh) province, otherwise this code will crash

			$this->debug('Found building ' . $building->id);
			$buildingstat = $building->buildingstat;
			$changes = $this->resourcesTemplateArray;
			$somethingLacking = FALSE;

			// Feed workers
			if ($settlersCanEat) {
				$foodEatenByWorkers = (int)($building->workers_assigned * $this->options->foodBySettler * $buildingstat->food_by_worker);
				if ($counts['food'] < $foodEatenByWorkers) {
					// Not enough food, building stops
					$building->stopped = TRUE;
					$building->save();
					if ($counts['food'] != 0 && $province->user_id != NULL) {
						Utils::addInfo($province->user, '[workers-eat] Building ' . $buildingstat->type . ' on province ' . $province->name . ' stopped working because the workers had nothing to eat!');
					}
					$this->debug('Workers can eat on province ' . $province->id . ', building ' . $building->id . ' stopped.');
					continue;
				} else {
					$counts['food'] -= $foodEatenByWorkers;
					$this->debug('Workers ate ' . $foodEatenByWorkers . ' food.');
				}
			}

			foreach ($this->resourcesNames as $resource) {
				$change = $buildingstat->{$resource . '_gain'} * ((float)$building->workers_assigned / $buildingstat->workers_max);

				if ($change != 0) {
					$this->debug('Changing ' . $resource . ' by ' . $change);

					$changes[$resource] = $change;

					if ($counts[$resource] + $change > $maxes[$resource]) {
						$change = $maxes[$resource] - $counts[$resource];
						$this->debug('Max value achieved for ' . $resource);
						if ($counts[$resource] != $maxes[$resource] && $province->user_id != NULL) {
//							Utils::addInfo($province->user, '[storage] Province ' . $province->name . ' cannot store more ' . $resource);
						}
					} else if ($counts[$resource] + $change < 0) {
						if ($counts[$resource] != 0 && $province->user_id != NULL) {
							Utils::addInfo($province->user, '[resources] The ' . $buildingstat->type . ' in province ' . $province->name . ' cannot work because of infufficient ' . $resource . '.');
						}
						$somethingLacking = TRUE;
						break;
					}
				}
			}

			if ($somethingLacking) {
				$this->debug('Insufficient resources for the building to work');
				$building->stopped = TRUE;
			} else {
				$building->stopped = FALSE;
				foreach ($this->resourcesNames as $resource) {
					$counts[$resource] += $changes[$resource];
					$this->debug('Now ' . $resource . ' is ' . $counts[$resource]);
				}
			}

			$building->save();
		}

		foreach ($this->resourcesNames as $resource) {
			$province->{$resource . '_count'} = $counts[$resource];
		}

		$province->save();
	}

	protected function debug($message) {
		echo '[' . date('H:i:s') . '] ' . $message . "\n";
	}
}
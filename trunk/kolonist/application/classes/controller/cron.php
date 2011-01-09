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

		if (time() < $lastcron->value + $this->options->cronInterval) {
			die('Request made to soon');
		}

		$provinces = ORM::factory('province')->find_all();

		foreach ($provinces as $province) {
			$this->debug('Going through province ' . $province->id);
			$this->cycleProvince($province);
		}

		// TODO: dodac info o zdarzeniach

		$lastcron->value = time();
		$lastcron->save();
		die('Succeed');
	}

	protected function cycleProvince($province) {
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
		if ($province->user_id != NULL) {
			$foodEatenBySettlers = $counts['settlers'] * $this->options->foodBySettler;
			if ($counts['food'] < $foodEatenBySettlers) {
				// Not enough food, some settlers eat, some go away
				$settlersThatEat = (int)($counts['food'] / $this->options->foodBySettler);
				$settlersThatGo = $counts['settlers'] - $settlersThatEat;
				$counts['food'] = 0;
				$counts['settlers'] -= $settlersThatGo;
				Utils::addInfo($province->user, '[settlers-eat] Province ' . $province->name . ' lost ' . $settlersThatGo . ' settlers because they had nothing to eat!');
				$this->debug('Nothing to eat on province ' . $province->id . ', ' . $settlersThatGo . ' settlers gone.');
			} else {
				$counts['food'] -= $foodEatenBySettlers;
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
			$foodEatenByWorkers = $building->workers_assigned * $buildingstat->food_by_worker;
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
							Utils::addInfo($province->user, '[storage] Province ' . $province->name . ' cannot store more ' . $resource);
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
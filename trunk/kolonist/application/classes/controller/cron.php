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
		$counts = $this->resourcesTemplateArray;
		foreach ($this->resourcesNames as $resource) {
			$counts[$resource] = $province->{$resource . '_count'};
		}

		foreach ($province->buildings->find_all() as $building) {
			if (!$building) {
				continue;
			}

			$this->debug('Found building ' . $building->id);
			$buildingstat = $building->buildingstat;
			$changes = $this->resourcesTemplateArray;
			$somethingLacking = FALSE;

			foreach ($this->resourcesNames as $resource) {
				$change = $buildingstat->{$resource . '_gain'} * ((float)$building->workers_assigned / $buildingstat->workers_max);

				if ($change != 0) {
					$this->debug('Changing ' . $resource . ' by ' . $change);

					$changes[$resource] = $change;

					if ($change > $buildingstat->{$resource . '_max'}) {
						$change = $buildingstat->{$resource . '_max'};
						$this->debug('Max value achieved for ' . $resource);
						if ($province->user_id != NULL) {
							Utils::addInfo($province->user, 'Province ' . $province->name . ' cannot store more ' . $resource);
						}
					} else if ($counts[$resource] - $change < 0) {
						$somethingLacking = TRUE;
						break;
					}
				}
			}

			if ($somethingLacking) {
				$this->debug('Insufficient resources for the building to work');
				if ($province->user_id != NULL) {
					Utils::addInfo($province->user, 'The ' . $buildingstat->type . ' in province ' . $province->name . ' cannot work because of infufficient resources.');
				}
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
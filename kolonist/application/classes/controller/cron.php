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

		$gains = $maxes = $this->resourcesTemplateArray;

		foreach ($province->buildings->find_all() as $building) {
			if (!$building) {
				continue;
			}

			$buildingstat = $building->buildingstat;
			$counts_temp = $counts;
			$somethingLacking = FALSE;

			foreach ($this->resourcesNames as $resource) {if($buildingstat->workers_max == null) var_dump($building->id);
				$counts_temp[$resource] += $buildingstat->{$resource . '_gain'} * ((float)$building->workers_assigned / $buildingstat->workers_max);
			}

			foreach ($this->resourcesNames as $resource) {
				if ($counts_temp[$resource] < 0) {
					$somethingLacking = TRUE;
					break;
				} else if ($counts_temp[$resource] > $buildingstat->{$resource . '_max'}) {
					$counts_temp[$resource] = $buildingstat->{$resource . '_max'};
				}
			}

			if ($somethingLacking) {
				$building->stopped = TRUE;
			} else {
				$building->stopped = FALSE;
				$counts = $counts_temp;
			}

			$building->save();
		}

		foreach ($this->resourcesNames as $resource) {
			$province->{$resource . '_count'} = $counts[$resource];
		}

		$province->save();
	}
}
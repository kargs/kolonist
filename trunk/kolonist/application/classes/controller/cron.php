<?php

class Controller_Cron extends Controller_Default {

	protected $resourcesTemplateArray;
	protected $resourcesNames;

	public function before() {
		parent::before();

		$this->resourcesTemplateArray = Kohana::config('resources');
		$this->resourcesNames = array_values($this->resourcesTemplateArray);
	}

	public function action_cycle() {
		// TODO: sprawdzic czy wywolanie nie nastapilo za wczesnie

		// TODO: wyliczyc settlers_gain w kazdej prowincji, i brac pod uwage prowincjowy settlers_max

		// TODO: wziac pod uwage workersow

		$provinces = ORM::factory('province')->find_all();

		foreach ($provinces as $province) {
			$this->cycleProvince($province);
		}

		// TODO: dodac info o zdarzeniach
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

			foreach ($this->resourcesNames as $resource) {
				$counts_temp[$resource] += $buildingstat->{$resource . '_gain'};
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
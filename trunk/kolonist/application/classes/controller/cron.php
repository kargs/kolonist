<?php

class Controller_Cron extends Controller_Default {

	protected $resourcesTemplateArray = array(
		'settlers' => 0,
		'soldiers' => 0,
		'armament' => 0,
		'food'     => 0,
		'wood'     => 0,
		'iron'     => 0,
		'brick'    => 0,
	);

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
		foreach ($this->resourcesTemplateArray as $resource => $nevermind) {
			$counts[$resource] = $province->{$resource . '_count'};
		}

		$gains = $maxes = $this->resourcesTemplateArray;

		foreach ($province->slots->find_all() as $slot) {
			if (!$slot->building) {
				continue;
			}

			$buildingstat = $slot->building->buildingstat;
			$counts_temp = $counts;
			$somethingLacking = FALSE;

			foreach ($this->resourcesTemplateArray as $resource => $nevermind) {
				$counts_temp[$resource] += $buildingstat->{$resource . '_gain'};
			}

			foreach ($this->resourcesTemplateArray as $resource => $nevermind) {
				if ($counts_temp[$resource] < 0) {
					$somethingLacking = TRUE;
					break;
				} else if ($counts_temp[$resource] > $buldingstat->{$resource . '_max'}) {
					$counts_temp[$resource] = $buldingstat->{$resource . '_max'};
				}
			}

			if ($somethingLacking) {
				$slot->building->stopped = TRUE;
			} else {
				$slot->building->stopped = FALSE;
				$counts = $counts_temp;
			}

			$slot->building->save();
		}

		foreach ($this->resourcesTemplateArray as $resource => $nevermind) {
			$province->{$resource . '_count'} = $counts[$resource];
		}

		$province->save();
	}
}
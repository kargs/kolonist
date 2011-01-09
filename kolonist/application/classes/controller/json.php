<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Json extends Controller_Default {

	protected $resourcesTemplateArray;
	protected $resourcesNames;
	protected $options;

	public $access = array(
		':default' => Controller_Default::ACCESS_ANYONE,
	);

	public $template = 'layout/json';
	private $_timeStart;


	public function before() {
		$this->_timeStart = time();
		parent::before();

		$this->view = array();
		$this->template->status_code = 'OK';
		$this->template->status_message = '';

		$this->request->headers['Content-Type'] = 'text/plain';

		$this->resourcesTemplateArray = (array) Kohana::config('resources');
		$this->resourcesNames = array_keys($this->resourcesTemplateArray);
		$this->options = Kohana::config('options');
	}
	
	public function after() {
		$this->template->content = json_encode($this->view);
		$this->template->status_time = time() - $this->_timeStart;

		parent::after();
	}

	public function action_currentuser() {
		$this->view['id'] = $this->user->id;
		$this->view['username'] = $this->user->username;
	}

	/**
	 * Creates new building of type $building_type, and assignes it to the slot
	 * $slot_index of province $province_id.
	 */
	public function action_createbuilding($province_id, $slot_index, $building_type) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		$existingBuilding = $province->buildings->where('slot_index', '=', $slot_index)->find();

		if ($existingBuilding->id !== NULL) {
			return $this->error('A building exists on given slot.');
		}

		$buildingstat = ORM::factory('buildingstat')->where('type', '=', $building_type)->where('level', '=', 1)->find();

		if ($buildingstat->id === NULL) {
			return $this->error('There is no building of type given.');
		}

		if (!$this->canCreateBuilding($province, $buildingstat)) {
			return $this->error('Not enough resources to create the building.');
		}

		$this->removeResourcesForNewBuilding($province, $buildingstat);
		$province->save();

		$building = ORM::factory('building');
		$building->buildingstat = $buildingstat;
		$building->province = $province;
		$building->slot_index = $slot_index;
		$building->level = 1;
		$building->workers_assigned = 1;
		$building->stopped = 0;

		$building->save();

		return $this->success('Building created.');
	}

	public function action_destroybuilding($province_id, $slot_index) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		$existingBuilding = $province->buildings->where('slot_index', '=', $slot_index)->find();

		if ($existingBuilding->id === NULL) {
			return $this->error('A building does not exist on given slot.');
		}

		$existingBuilding->delete();

		return $this->success('Building removed.');
	}

	/**
	 * Upgrades the building assigned to the $slot_index in province $province_id.
	 */
	public function action_upgradebuilding($province_id, $slot_index) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		$building = $province->buildings->where('slot_index', '=', $slot_index)->find();

		if ($building->id === NULL) {
			return $this->error('Building not found.');
		}

		$upgradedBuildingstat = ORM::factory('buildingstat')->where('type', '=', $building->buildingstat->type)->where('level', '=', $building->level + 1)->find();

		if ($upgradedBuildingstat->id === NULL) {
			return FALSE;
		}

		if (!$this->canCreateBuilding($province, $upgradedBuildingstat)) {
			return $this->error('Not enough resources to upgrade the building or building cannot be upgraded on higher level.');
		}
		
		$this->removeResourcesForNewBuilding($province, $upgradedBuildingstat);
		$province->save();

		$building->level += 1;
		$building->save();
		return $this->success('Building upgraded.');
	}

	/**
	 *
	 */
	public function action_attachworkers($province_id, $slot_index, $workers_assigned) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		$building = $province->buildings->where('slot_index', '=', $slot_index)->find();

		if ($workers_assigned < 0 || $workers_assigned > $building->buildingstat->workers_max) {
			return $this->error('Tried to assign to much or to few workers.');
		}

		$building->workers_assigned = $workers_assigned;
		$building->save();

		return $this->success('Workers assigned.');
	}

	public function action_getarmyinfo() {
		$provinces = ORM::factory('province')->where('user_id', '=', $this->user->id)->find_all();

		$armyinfo = array();
		foreach ($provinces as $province) {
			$armyinfo[] = array(
				'provinceId' => $province->id,
				'maxArmy' => $province->soldiers_count,
				'armament' => $province->armament_count,
			);
		}

		$this->view = $armyinfo;
	}

	/**
	 * Does the "battle" between provinces.
	 */
	public function action_fight($provinceToAttackId) {
		$provinceToAttack = ORM::factory('province', $provinceToAttackId);

		if ($provinceToAttack->id === NULL) {
			return $this->error('No province with given ID exists.');
		} else if ($this->isUserOwnerOfProvince($provinceToAttack)) {
			return $this->error('User is already an owner of given province.');
		}

		if (!isset($_POST['data'])) {
			return $this->error('Bad request.');
		}

		$provincesInfo = array();
		foreach ($_POST['data'] as $squadron) {
			$provinceInfo = array(
				'province' => ORM::factory('province', $squadron['provinceId']),
				'army' => $squadron['army'],
			);

			if ($provinceInfo['province']->user->id !== $this->user->id) {
				return $this->error('One or more of selected provinces are not belong to us.');
			}

			if ($provinceInfo['army'] > $provinceInfo['province']->soldiers_count) {
				return $this->error('Not enough soldiers in province.');
			}

			$provincesInfo[] = $provinceInfo;
		}

		// compute the attack
		$attack = 0;
		foreach ($provincesInfo as $provinceInfo) {
			if ($provinceInfo['province']->soldiers_count == 0) continue;
			$armament_gain = $this->computeArmamentGain($provinceInfo['province']->armament_count / $provinceInfo['province']->soldiers_count);
			$attack += $provinceInfo['army'] * $armament_gain;
		}

		// compute the defense
		if ($provinceToAttack->soldiers_count > 0) {
			$armament_gain = $this->computeArmamentGain($provinceToAttack->armament_count / $provinceToAttack->soldiers_count);
			$defense = $provinceToAttack->soldiers_count * $armament_gain;
		} else {
			$defense = 0;
		}

		// Buildings can add to the defense
		$buildingsDefense = 0;
		foreach ($provinceToAttack->buildings->find_all() as $building) {
			if ($building) {
				$buildingsDefense += $building->buildingstat->defense;
			}
		}

		$buildingsDefense *= ($this->options->fightBuildingsDefense / 100);
		if ($defense == 0) {
			$fightInformation['buildingsDefenseRatio'] = 1;
		}  else {
			// The percentage of defense given by buildings to the defense of army
			$fightInformation['buildingsDefenseRatio'] = $buildingsDefense / $defense;
		}

		$defense += $buildingsDefense;

		// Very little chance for absolute luck
		if (rand(0, abs($attack - $defense)) < $this->options->fightAbsoluteLuckLevel) {
			// If the armies are equal, it's 100% that the fight depends on luck
			// The stronger the difference, the less chance for solving fight by luck
			// Luck can add or substract up to 100% of $defense value
			$luck = rand(-$attack, $defense);
			$attack += $luck;
			$fightInformation['luck'] = $luck / $attack;
		} else {
			$fightInformation['luck'] = 0;
		}

		if ($attack == $defense || $defense == 0) {
			// Equal? Someone needs to win
			$defense += 1;
		} if ($attack == 0) {
			// It's only possible if the attacker has 0 armament for every province
			$attack +=1;
		}

		// Compute the gains and losses
		$ratio = ($attack > $defense) ? ($attack / $defense) : ($defense / $attack);
		if ($ratio > $this->options->fightRatioCap) $ratio = $this->options->fightRatioCap;

		$fightInformation['attack'] = $attack;
		$fightInformation['ratio'] = ($attack > $defense) ? $ratio : 1 / $ratio;

		$looserLossPercentage = 50 + ($ratio / $this->options->fightRatioCap) * $this->options->fightMaxPercentLoss;
		$looserLossRandomPercentage = $this->computeRandomLoss($ratio);
		$looserLossDecimal = ($looserLossPercentage + $looserLossRandomPercentage) / (float) 100;
		$winnerLossPercentage = 100 - $looserLossPercentage;
		$winnerLossRandomPercentage = -$this->computeRandomLoss($ratio);
		$winnerLossDecimal = ($winnerLossPercentage + $winnerLossRandomPercentage) / (float) 100;


		if ($attack > $defense) {
			// Attacker won
			$fightInformation['won'] = true;

			// Attacker loses few soldiers
			$fightInformation['losts'] = $this->computeFightLosses($provincesInfo, $winnerLossDecimal);
			$fightInformation['lostDecimal'] = $winnerLossDecimal;

			// Victim loses many soldiers
			$victimLosts = $looserLossDecimal * $provinceToAttack->soldiers_count;
			$provinceToAttack->soldiers_count -= $victimLosts;
			$provinceToAttack->armament_count -= $looserLossDecimal * $provinceToAttack->armament_count;
			$fightInformation['victimLosts'] = $victimLosts;
			if ($provinceToAttack->user_id != 0) {
				Utils::addInfo($provinceToAttack->user, '[fight-loose] You lost province ' . $provinceToAttack->name . '!');
			}

			// Update province ownership
			$provinceToAttack->user = $this->user;
			$provinceToAttack->save();
		} else {
			// Attacker lost
			$fightInformation['won'] = false;

			// Attacker loose many soldiers
			$fightInformation['losts'] = $this->computeFightLosses($provincesInfo, $looserLossDecimal);
			$fightInformation['lostDecimal'] = $looserLossDecimal;

			// Victim loses few soldiers
			$victimLosts =  $winnerLossDecimal * $provinceToAttack->soldiers_count;
			$provinceToAttack->soldiers_count -= $victimLosts;
			$provinceToAttack->armament_count -= $winnerLossDecimal * $provinceToAttack->armament_count;
			$fightInformation['victimLosts'] = $victimLosts;
			$provinceToAttack->save();
			if ($provinceToAttack->user_id != NULL) {
				Utils::addInfo($provinceToAttack->user, '[fight-win] Your province ' . $provinceToAttack->name . 'was attacked but it survived!');
			}
		}

		$this->view = $fightInformation;
	}

	/**
	 * Returns info about particular province.
	 */
	public function action_getprovinceinfo($id) {

		$province = ORM::factory('province', $id);

		$this->view['id'] = $province->id;
		$this->view['name'] = $province->name;
		$this->view['slots'] = array();

		$maxes = $gains = $this->resourcesTemplateArray;

		foreach($province->buildings->find_all() as $building) {
			if ($building) {
				$jsonSlot['building']['slot_index'] = $building->slot_index;
				$jsonSlot['building']['type'] = $building->buildingstat->type;
				$jsonSlot['building']['level'] = $building->level;
				$jsonSlot['building']['workers'] = $building->workers_assigned;
				$jsonSlot['building']['stopped'] = $building->stopped;

				foreach ($this->resourcesNames as $resource) {
					$maxes[$resource] += $building->buildingstat->{$resource . '_max'};
					$gains[$resource] += $building->buildingstat->{$resource . '_gain'};
				}
			} else {
				$jsonSlot['building'] = null;
			}
			$this->view['slots'][] = $jsonSlot;
		}

		$this->view['resources']['settlers'] = $province->settlers_count;
		$this->view['resources']['soldiers'] = $province->soldiers_count;
		$this->view['resources']['armament'] = $province->armament_count;
		$this->view['resources']['food'] = $province->food_count;
		$this->view['resources']['wood'] = $province->wood_count;
		$this->view['resources']['iron'] = $province->iron_count;
		$this->view['resources']['brick'] = $province->brick_count;

		$this->view['maxes'] = $maxes;
		$this->view['gains'] = $gains;
	}

	/**
	 * Returns info about all building types in the game.
	 */
	public function action_getbuildingstats() {
		$buildingstats = ORM::factory('buildingstat')->find_all();

		foreach ($buildingstats as $buildingstat) {
			$this->view[] = $buildingstat->as_array();
		}
	}

	/**
	 * Returns info about the world. It has to be invoked regularly.
	 */
	public function action_cycle() {
		$provinces = ORM::factory('province')->with('user')->find_all();

		foreach ($provinces as $province) {
			$jsonProvince['id'] = $province->id;
			$jsonProvince['name'] = $province->name;

			if (!$province->user) {
				$jsonProvince['owner'] = null;
			} else {
				$jsonProvince['owner']['id'] = $province->user->id;
				$jsonProvince['owner']['nickname'] = $province->user->username;
			}

			$this->view['provinces'][] = $jsonProvince;
		}

		$infos = ORM::factory('info')->where('user_id', '=', $this->user->id)->where('seen', '=', 0)->limit(20)->find_all();

		foreach ($infos as $info) {
			$jsonInfo['message'] = $info->message;
			$jsonInfo['date'] = date('Y-m-d H:i:s',  $info->date);
			$jsonInfo['isNew'] = !$info->seen;

			$this->view['infos'][] = $jsonInfo;

			$info->seen = 1;
			$info->save();
		}
	}

	public function action_messages() {
		$infos = ORM::factory('info')->where('user_id', '=', $this->user->id)->limit(100)->find_all();

		foreach ($infos as $info) {
			$jsonInfo['message'] = $info->message;
			$jsonInfo['date'] = date('Y-m-d H:i:s',  $info->date);
			$jsonInfo['isNew'] = !$info->seen;

			$this->view['infos'][] = $jsonInfo;

			$info->seen = 1;
			$info->save();
		}
	}

	public function action_cycle2() {
		$provinces = ORM::factory('province')->with('user')->find_all();

		foreach ($provinces as $province) {
			$jsonProvince['id'] = $province->id;
			$jsonProvince['name'] = $province->name;

			if (!$province->user) {
				$jsonProvince['owner'] = null;
			} else {
				$jsonProvince['owner']['id'] = $province->user->id;
				$jsonProvince['owner']['nickname'] = $province->user->username;
			}

			$this->view['provinces'][] = $jsonProvince;
		}

		
		$messages = array(
			'[fight-win] Your province X was attacked and you win!',
			'[fight-loose] Your province X was attacked and you lost it.',
			'[settlers-eat] Y settlers on province X had nothing to eat so they left!',
			'[workers-eat] Some workers for building xxxx on province X had nothing to eat so the building stopped.',
			'[storage] Storage capacity of xxxx on province X is full.',
			'[resources] There is not enough xxxx for building yyyy on province X to work so it is stopped.',
		);

		$n = 6;
		for ($i = 0; $i < $n; ++$i) {
			$jsonInfo['message'] = $messages[$i];
			$jsonInfo['date'] = date('Y-m-d H:i:s',  time() - ($n - $i) * 8600);

			$this->view['infos'][] = $jsonInfo;
		}
	}

	public function action_movesoldiers($province_from_id, $province_to_id, $amount) {
		if (($provinceFrom = $this->getAndCheckProvince($province_from_id)) === FALSE) {
			return FALSE;
		}

		if (($provinceTo = $this->getAndCheckProvince($province_to_id)) === FALSE) {
			return FALSE;
		}

		if ($provinceFrom->soldiers_count < $amount) {
			return $this->error('Not enough soldiers in the source province.');
		}

		$provinceFrom->soldiers_count -= $amount;
		$provinceTo->soldiers_count += $amount;

		$provinceFrom->save();
		$provinceTo->save();

		return $this->success('Soldiers moved.');
	}

	public function action_changeprovincename($province_id, $newname) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		$province->name = $newname;
		$province->save();

		return $this->success('Name changed.');
	}

	protected function isUserOwnerOfProvince($province) {
		return $province->user->id === $this->user->id;
	}

	protected function getAndCheckProvince($province_id) {
		$province = ORM::factory('province', $province_id);

		if ($province->id === NULL) {
			return $this->error('No province with given ID exists.');
		} else if (!$this->isUserOwnerOfProvince($province)) {
			return $this->error('User is not an owner of given province.');
		}

		return $province;
	}

	protected function canCreateBuilding($province, $buildingstat) {
		foreach ($this->resourcesNames as $resource) {
			if ($province->{$resource . '_count'} < $buildingstat->{$resource . '_requirement'}) {
				return FALSE;
			}
		}

		return TRUE;
	}

	protected function removeResourcesForNewBuilding($province, $buildingstat) {
		foreach ($this->resourcesNames as $resource) {
			$province->{$resource . '_count'} -= $buildingstat->{$resource . '_requirement'};
		}
	}

	protected function computeFightLosses($provincesInfo, $lostDecimal) {
		$losts = array();
		foreach ($provincesInfo as $provinceInfo) {
			if ($provinceInfo['province']->soldiers_count > 0) {
				$armamentLost = (int) ($lostDecimal * ((float)$provinceInfo['army'] / $provinceInfo['province']->soldiers_count) * $provinceInfo['province']->armament_count);
			} else {
				$armamentLost = 0;
			}

			$lost = array(
				'provinceId' => $provinceInfo['province']->id,
				'armylost' => (int) ($lostDecimal * $provinceInfo['army']),
				'armamentlost' => $armamentLost,
			);

			// Update the armies
			$provinceInfo['province']->soldiers_count -= $lost['armylost'];
			$provinceInfo['province']->armament_count -= $lost['armamentlost'];
			$provinceInfo['province']->save();

			$losts[] = $lost;
		}

		return $losts;
	}

	protected function computeArmamentGain($armamentArmyRatio) {
		$armamentGain = log10($armamentArmyRatio) + 1;
		if ($armamentGain < 0) {
			$armamentGain = 0;
		}

		return $armamentGain;
	}

	protected function computeRandomLoss($ratio) {
		// Maximal random loss value depends on fight ratio (the bigger ratio is, the lower maximal loss value)
		$max = (1 - ($ratio / $this->options->fightRatioCap)) * $this->options->fightRandomLoss;
		// Minimal value is proportional to maximal value (for example, <-20,20>, <-40,0>, <-30,10> etc)
		$min = -$this->options->fightRandomLoss * 2 + $max;
		return rand(-(int)$min, (int)$max);
	}

	protected function success($message) {
		$this->template->status_code = 'OK';
		$this->template->status_message = $message;
		return TRUE;
	}

	protected function error($message) {
		$this->template->status_code = 'FAIL';
		$this->template->status_message = $message;
		return FALSE;
	}
}

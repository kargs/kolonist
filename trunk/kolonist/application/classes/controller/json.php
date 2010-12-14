<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Json extends Controller_Default {

	protected $resourcesTemplateArray;
	protected $resourcesNames;

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
				'maxArmy' => $province->soldiers_count
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
				return $this->error('Not enought soldiers in province.');
			}

			$provincesInfo[] = $provinceInfo;
		}

		// compute the attack
		$attack = 0;
		foreach ($provincesInfo as $provinceInfo) {
			$attack += $provinceInfo['army'] * $provinceInfo['province']->armament_count;
		}

		// compute the defense
		$defense = $provinceToAttack->soldiers_count * $provinceToAttack->armament_count;

		if ($attack >= $defense) {
			// Attacker won
			$result['won'] = true;

			if ($attack == $defense) {
				// Attacker has slight advantage
				$attack += 0.001;
			}

			// Attacker loses few soldiers
			$lostDecimal = $attack / ($attack - $defense) / ($attack + $defense);
			$result['losts'] = $this->computeFightLosses($provincesInfo, $lostDecimal);

			// Victim loses many soldiers
			$lostDecimal = ($attack - $defense) / ($attack + $defense);
			$victimLost = $lostDecimal * $provinceToAttack->soldiers_count;
			$provinceToAttack->soldiers_count -= $victimLost;

			// Update province ownership
			$provinceToAttack->user = $this->user;
			$provinceToAttack->save();
		} else {
			// Attacker lost
			$result['won'] = false;

			// Attacker loose many soldiers
			$lostDecimal = ($defense - $attack) / ($defense + $attack);
			$result['losts'] = $this->computeFightLosses($provincesInfo, $lostDecimal);

			// Victim loses few soldiers
			$lostDecimal = $defense / ($defense - $attack) / ($defense + $attack);
			$victimLost = $lostDecimal * $provinceToAttack->soldiers_count;
			$provinceToAttack->soldiers_count -= $victimLost;
			$provinceToAttack->save();
		}

		$this->view = $result;
	}

	/**
	 * 
	 */
	public function action_checkrequirementsforcreate($province_id) {

	}

	/**
	 *
	 */
	public function action_checkrequirementsforupgrade($province_id, $slot_index) {

	}

	/**
	 * Returns info about particular province.
	 */
	public function action_getprovinceinfo($id) {

		$province = ORM::factory('province', $id);

		$this->view['id'] = $province->id;
		$this->view['name'] = $province->name;
		$this->view['slots'] = array();

		foreach($province->buildings->find_all() as $building) {
			if ($building) {
				$jsonSlot['building']['slot_index'] = $building->slot_index;
				$jsonSlot['building']['type'] = $building->buildingstat->type;
				$jsonSlot['building']['level'] = $building->level;
				$jsonSlot['building']['workers'] = $building->workers_assigned;
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

		// TODO: info o zmianach
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
			$lost = array(
				'provinceId' => $provinceInfo['province']->id,
				'armylost' => (int) ($lostDecimal * $provinceInfo['army']),
			);

			// Update the armies
			$provinceInfo['province']->soldiers_count -= $lost['armylost'];
			$provinceInfo['province']->save();

			$losts[] = $lost;
		}

		return $losts;
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

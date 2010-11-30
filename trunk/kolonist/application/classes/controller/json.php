<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Json extends Controller_Default {

	protected $resourcesTemplateArray;
	protected $resourcesNames;

	public $access = array(
		':default' => Controller_Default::ACCESS_LOGIN,
	);

	public $template = 'layout/json';

	public function before() {
		parent::before();

		$this->view = array();
		$this->template->status_code = 'OK';
		$this->template->status_message = '';

		$this->request->headers['Content-Type'] = 'text/plain';

		$this->resourcesTemplateArray = Kohana::config('resources');
		$this->resourcesNames = array_values($this->resourcesTemplateArray);
	}
	
	public function after() {
		$this->template->content = json_encode($this->view);

		parent::after();
	}

	/**
	 * Starts game - player gets the random unassigned province. This action
	 * can be invoked only once for particular player.
	 */
	public function action_startgame() {
		if (count($this->user->provinces->find_all()) > 0) {
			return $this->error('Cannot start the game if the user already has provinces.');
		}

		$province = ORM::factory('province')->where('user_id', '=', 0)->order_by(DB::expr('RAND()'), NULL)->find();

		if ($province->id === NULL) {
			return $this->error('No more free provinces available.');
		}

		$province->user = $this->user;
		$province->save();

		return $this->success('A province was assigned to the player.');
	}

	/**
	 * Creates new building of type $building_type, and assignes it to the slot
	 * $slot_index of province $province_id.
	 */
	public function action_createbuilding($province_id, $slot_index, $building_type) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		// TODO: check requirements

		$buildingstat = ORM::factory('buildingstat')->where('type', '=', $building_type)->where('level', '=', 1)->find();

		if ($buildingstat->id === NULL) {
			return $this->error('There is no building of type given.');
		}

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

	/**
	 * 
	 */
	public function action_upgradebuilding($province_id, $slot_index) {
		if (($province = $this->getAndCheckProvince($province_id)) === FALSE) {
			return FALSE;
		}

		$building = ORM::factory('building')->where('province_id', $province_id)->where('slot_index', $slot_index)->find();

		if ($building->id === NULL) {
			return $this->error('Building not found.');
		}

		if (!$this->canUpgradeBuilding($province, $building)) {
			return $this->error('Not enough resources to upgrade the building.');
		}

		foreach ($this->resourcesNames as $resource) {
			$province->{$resource . '_count'} -= $upgradedBuildingstat->{$resource . '_requirement'};
		}

		$province->save();

		$building->level += 1;
		$building->save();
		return $this->success('Building upgraded.');
	}

	public function action_attachworkers($province_id, $slot_index, $workers_count) {
		$province = ORM::factory('province', $province_id);

		// todo check if province exists

		if ($province->user->id !== $this->user->id) {
			echo 'bad user id';die;
		}

		$building = $province->buildings->where('slot_index', '=', $slot_index)->find();

		if ($workers_count < 0 || $workers_count > $building->buildingstat->workers_max) {
			echo 'bad workers count';die;
		}

		$building->workers_assigned = $workers_count;
		$building->save();

		// TODO: info
	}

	public function action_conquerprovince($province_id) {
		// TODO: later
	}

	public function action_checkrequirementsforcreate($province_id) {

	}

	public function action_checkrequirementsforupgrade($province_id, $slot_index) {

	}

	public function action_getprovinceinfo($id) {

		$province = ORM::factory('province', $id);

		$this->view['id'] = $province->id;
		$this->view['name'] = $province->name;
		$this->view['slots'] = array();

		foreach($province->buildings->find_all() as $building) {
			if ($building) {
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

	public function action_getbuildingstats() {
		$buildingstats = ORM::factory('buildingstat')->find_all();

		foreach ($buildingstats as $buildingstat) {
			$this->view[] = $buildingstat->as_array();
		}
	}

	public function action_cycle() {
		$provinces = ORM::factory('province')->find_all();

		foreach ($provinces as $province) {
			$jsonProvince['id'] = $province->id;

			if (!$province->user) {
				$jsonProvince['owner'] = null;
			} else {
				$jsonProvince['owner']['id'] = $province->user->id;
				$jsonProvince['owner']['nickname'] = $province->user->nickname;
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

	protected function canUpgradeBuilding($province, $building) {
		$upgradedBuildingstat = ORM::factory('buildingstat')->where('type', '=', $building->buildingstat->type)->where('level', '=', $building->level + 1)->find();

		if ($upgradedBuildingstat->id === NULL) {
			return FALSE;
		}

		foreach ($this->resourcesNames as $resource) {
			if ($province->{$resource . '_count'} < $upgradedBuildingstat->{$resource . '_requirement'}) {
				return FALSE;
			}
		}

		return TRUE;
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
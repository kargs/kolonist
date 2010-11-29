<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Json extends Controller_Default {

	public $access = array(
		':default' => self::ACCESS_LOGIN,
	);

	public $template = 'layout/json';

	public function before() {
		parent::before();

		$this->view = array();
		$this->template->status_code = 'OK';
		$this->template->status_message = '';

		$this->request->headers['Content-Type'] = 'text/plain';
	}
	
	public function after() {
		$this->template->content = json_encode($this->view);

		parent::after();
	}

	public function action_startgame() {
		$province = ORM::factory('province')->where('user_id', '=', 0)->orderby(DB::expr('RAND()'), NULL)->find();
		$province->user_id = $this->user->id;
		$province->save();

		// TODO: return info
	}

	public function action_createbuilding($province_id, $slot_index, $building_type) {
		// TODO: check requirements

		$buildingstat = ORM::factory('buildingstat')->where('type', '=', $building_type)->where('level', '=', 1)->find();

		// TODO: check if buildingstat exists

		$building = ORM::factory('building');

		$building->buildingstat_id = $buildingstat->id;

		// unfinished!
	}

	public function action_upgradebuilding($province_id, $slot_index) {

	}

	public function action_attachworkers($province_id, $slot_index, $workers_count) {

	}

	public function action_conquerprovince($province_id) {

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

		foreach($province->slots->find_all() as $slot) {
			if (!$slot->building) {
				$jsonSlot['building']['type'] = $slot->building->buildingstat->name;
				$jsonSlot['building']['level'] = $slot->building->level;
				$jsonSlot['building']['workers'] = $slot->building->workers_count;
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
}
<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Json extends Controller_Default {

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

	public function action_province($id) {

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

	public function action_buildingstats() {
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
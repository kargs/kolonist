<?php defined('SYSPATH') or die('No direct script access.');

class Utils {

	static public function addInfo($user, $message) {
		$info = ORM::factory('info');
		$info->user = $user;
		$info->message = $message;
		$info->date = time();
		$info->seen = 0;
		$info->save();
	}
}
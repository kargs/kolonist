<?php defined('SYSPATH') or die('No direct script access.');

class Request extends Kohana_Request {

	static public function subrequest($uri) {
		$_GET['nolayout'] = TRUE;
		return parent::factory($uri);
	}
}
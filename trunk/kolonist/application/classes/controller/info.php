<?php defined('SYSPATH') or die('No direct script access.');

/**
 * This controller renders a view which name is provided as a parameter. For
 * example, when url is "info/test", the view file "test.php" will be rendered.
 * All view files have to be placed in "info" folder and are loaded dynamically
 * (i.e. there is no need to define separate actions for them).
 */
class Controller_Info extends Controller_Default {

	public function action_index() {
		$page = strtolower(Request::instance()->param('page'));

		try {
			$this->view = View::factory('info/' . $page);
		} catch (Exception $e) {
			Request::instance()->redirect('failure/notfound');
		}

		$this->template->content = $this->view;
	}
}
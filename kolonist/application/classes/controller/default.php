<?php defined('SYSPATH') or die('No direct script access.');

abstract class Controller_Default extends Controller_Template {

	const ACCESS_ANYONE = -1;
	const ACCESS_GUEST = 0;

	const ACCESS_LOGIN = 1;
	const ACCESS_ADMIN = 2;

	public $access = array(':default' => self::ACCESS_ANYONE);

	public $template = 'layout/default';
	public $view;

	protected $auth;
	protected $user;

	public function before() {
		parent::before();

		$this->user = Auth::instance()->get_user();

		$controller = strtolower($this->request->controller);
		$action = strtolower($this->request->action);
		$general_name = $controller . '/' . $action;

		if (isset($this->access[$action])) {
			$access = $this->access[$action];
		} else {
			$access = $this->access[':default'];
		}

		if ($access === self::ACCESS_GUEST && Auth::instance()->logged_in()) {
			// User is logged in, but the access is for logged out only
			Request::instance()->redirect('failure/guestonly');
		} else if ($access > self::ACCESS_GUEST && !Auth::instance()->logged_in($access)) {
			// User has no sufficient privileges
			Request::instance()->redirect('failure/noaccess');
		}

		foreach (array($general_name, $controller . '/default', 'failure/noview') as $template) {
			try {
				$this->view = View::factory($template);
				break;
			} catch (Exception $e) {}
		}

		// Form data is stored there
		$this->view->errors = array();
		$this->view->values = array();

		$this->template->content = $this->view;
	}
}
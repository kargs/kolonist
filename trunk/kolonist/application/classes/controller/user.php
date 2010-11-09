<?php defined('SYSPATH') or die('No direct script access.');

class Controller_User extends Controller_Default {

	public $access = array(
		':default' => Controller_Default::ACCESS_LOGIN,
		'index'    => Controller_Default::ACCESS_ANYONE,
		'register' => Controller_Default::ACCESS_GUEST,
		'login'    => Controller_Default::ACCESS_GUEST,
	);

	public function action_index() {
		$this->request->response = 'hello, world!';
	}

	function action_register() {
		if ($_POST) {
			$user = ORM::factory('user');
			$post = $user->validate_create($_POST);

			if ($post->check()) {
				$user->values($post);

				$user->save();

				$login_role = new Model_Role(array('name' => 'login'));
				$user->add('roles', $login_role);

				Auth::instance()->login($post['username'], $post['password']);

				Request::instance()->redirect('welcome');
			} else {
				$this->view->errors = $post->errors('register');
			}
		}
	}

	public function action_login() {
		if ($_POST) {
			$user = ORM::factory('user');

			if ($user->login($_POST)) {
				Request::instance()->redirect('welcome');
			} else {
				$this->view->errors = $_POST->errors('login');
			}
		}
	}

	public function action_logout() {
		Auth::instance()->logout();
		Request::instance()->redirect('welcome');
	}
}
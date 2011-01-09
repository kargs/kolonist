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
			$_POST = $user->validate_create($_POST);

			if ($_POST->check()) {
				$user->values($_POST);

				$user->save();

				$login_role = new Model_Role(array('name' => 'login'));
				$user->add('roles', $login_role);

				Auth::instance()->login($_POST['username'], $_POST['password']);
				$this->user = Auth::instance()->get_user();

				// Attach user to one province
				$province = ORM::factory('province')->where('user_id', '=', 0)->order_by(DB::expr('RAND()'), NULL)->find();

				if ($province->id === NULL) {
					// TODO: handle this error properly
					Request::instance()->redirect('info/nofreeprovinces');
				}

				$province->user = $this->user;
				$province->save();

				Request::instance()->redirect('user/index');
			} else {
				$this->view->errors = $_POST->errors('register');
				$this->view->values = array_merge($_POST->as_array(), array('password' => '', 'password_confirm' => ''));
			}
		}
	}

	public function action_login() {
		if ($_POST) {
			$user = ORM::factory('user');

			if ($user->login($_POST)) {
				Request::instance()->redirect('user/index');
			} else {
				$this->view->errors = $_POST->errors('login');
				$this->view->values = array_merge($_POST->as_array(), array('password' => ''));
			}
		}
	}

	public function action_logout() {
		Auth::instance()->logout();
		Request::instance()->redirect('welcome');
	}
}
<?php

class Controller_Start extends Controller_Default {

	public function action_index() {
		if (!Auth::instance()->logged_in()) {
			Request::instance()->redirect('user/index');
		}

		Request::instance()->redirect('game.html');
	}
}
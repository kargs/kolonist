<?php defined('SYSPATH') or die('No direct script access.');

/**
 * A controller with errors. Any action can redirect to one of these actions
 * when an error occurs.
 */
class Controller_Failure extends Controller_Default {

	public function action_noaccess() {
		// User has no sufficient privileges
	}

	public function action_guestonly() {
		// User is logged in but only guests can access
	}

	public function action_noview() {
		// Requested view file not found
	}

	public function action_notfound() {
		// Page not found, used when requested not existing info page
	}
}

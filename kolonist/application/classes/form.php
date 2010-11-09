<?php defined('SYSPATH') or die('No direct script access.');

class Form extends Kohana_Form {

	static public $errors = array();
	static public $values = array();

	static public function field($id, $label, $type, array $attributes = array()) {
		$result = '<div class="fieldbundle">';
		if (isset(self::$errors[$id])) $result .= '<div class="error"><p class="error">' . self::$errors[$id] . '</p></div>';
		$result .= '<div class="field">';
		$result .= form::label($id, $label);
		$value = (isset(self::$values[$id])) ? self::$values[$id] : '';
		$result .= form::$type($id, $value, array_merge(array('id' => $id), $attributes));
		$result .= '</div></div>';
		return $result;
	}
}
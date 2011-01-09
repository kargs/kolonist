<?php
class Model_Info extends ORM {

	protected $_belongs_to = array('user' => array());
	protected $_sorting = array('date' => 'DESC');
}
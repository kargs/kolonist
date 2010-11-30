<?php
class Model_Province extends ORM {

	protected $_has_many = array('buildings' => array());
	protected $_belongs_to = array('user' => array());

}
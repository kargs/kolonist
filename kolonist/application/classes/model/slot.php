<?php
class Model_Slot extends ORM {

	protected $_belongs_to = array('province' => array());
	protected $_has_one = array('building' => array());
	protected $_sorting = array('index' => 'ASC');

}
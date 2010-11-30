<?php
class Model_Building extends ORM {

	protected $_belongs_to = array(
		'buildingstat' => array(),
		'province' => array()
	);
}
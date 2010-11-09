<?php defined('SYSPATH') OR die('No direct access allowed.');

class Model_User extends Model_Auth_User {
	
    public static function initialize(Jelly_Meta $meta)
    {
        $meta->fields = array(
            'email' => new Field_Email(array(
                'unique' => TRUE,
                'rules' => array(
                    'not_empty' => array(TRUE),
                )
            )),
        );
        
        parent::initialize($meta);
    }   
	
} // End User Model
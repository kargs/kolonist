<?php form::$errors = isset ($errors) ? $errors : null ?>
<?php form::$values = isset ($values) ? $values : null ?>

<?php echo form::open('user/login') ?>
<?php echo form::field('username', 'Username', 'input') ?>
<?php echo form::field('password', 'Password', 'password') ?>
<?php echo form::submit('submit','Login') ?>
<?php echo form::close() ?>
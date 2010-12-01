<?php form::$errors = isset ($errors) ? $errors : null ?>
<?php form::$values = isset ($values) ? $values : null ?>

<?php echo form::open('user/login') ?>
<?php echo form::field('username', 'Login', 'input') ?>
<?php echo form::field('password', 'Hasło', 'password') ?>
<?php echo form::submit('submit','Loguj') ?>
<?php echo form::close() ?>

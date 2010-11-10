<?php form::$errors = isset ($errors) ? $error : null ?>
<?php form::$values = isset ($values) ? $values : null ?>

<?php echo form::open('user/register') ?>
<?php echo form::field('email', 'E-mail', 'input') ?>
<?php echo form::field('username', 'Username', 'input') ?>
<?php echo form::field('password', 'Password', 'password') ?>
<?php echo form::field('password_confirm', 'Password Confirm', 'password') ?>
<?php echo form::submit('submit','Register') ?>
<?php echo form::close() ?>
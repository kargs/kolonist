<?php form::$errors = isset ($errors) ? $errors : null ?>
<?php form::$values = isset ($values) ? $values : null ?>

<?php echo form::open('user/register') ?>
<?php echo form::field('email', 'E-mail', 'input') ?>
<?php echo form::field('username', 'Login', 'input') ?>
<?php echo form::field('password', 'Hasło', 'password') ?>
<?php echo form::field('password_confirm', 'Powtórz hasło', 'password') ?>
<?php echo form::submit('submit','Rejestruj') ?>
<?php echo form::close() ?>
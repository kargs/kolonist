<?php form::$errors = $errors ?>
<?php form::$values = $values ?>

<?php echo form::open() ?>
<?php echo form::field('email', 'E-mail', 'input') ?>
<?php echo form::field('username', 'Username', 'input') ?>
<?php echo form::field('password', 'Password', 'password') ?>
<?php echo form::field('password_confirm', 'Password Confirm', 'password') ?>
<?php echo form::submit('submit','Register') ?>
<?php echo form::close() ?>
<?php form::$errors = isset ($errors) ? $errors : null ?>
<?php form::$values = isset ($values) ? $values : null ?>

<?php echo form::open('user/register') ?>
<?php echo form::field('email', 'E-mail', 'input') ?>
<?php echo form::field('username', 'Login', 'input') ?>
<?php echo form::field('password', 'Password', 'password') ?>
<?php echo form::field('password_confirm', 'Confirm', 'password') ?>
 <div class="confirmRegisterButton">
    <?php echo form::submit('submit','Register') ?>
 </div>
<?php echo form::close() ?>

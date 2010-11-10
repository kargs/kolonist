<?php if(Auth::instance()->logged_in()): ?>
<a href="<?= url::base();?>game.html">Rozpocznij grę</a><br/>
<a href="<?= url::base();?>user/logout">Wyloguj</a>
<?php else: ?>
<div class="login_form">
    <?php echo View::factory('user/login'); ?>
</div>
<div class="register_form">
    <?php echo View::factory('user/register'); ?>
</div>
<?php endif; ?>
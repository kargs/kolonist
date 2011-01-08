<?php if(Auth::instance()->logged_in()): ?>
<a href="/game.html">Start the game</a><br/>
<a href="<?php echo url::site('user/logout') ?>">Log out</a>
<?php else: ?>
<div class="login_form">
    <?php echo Request::subrequest('user/login')->execute()->response ?>
</div>
<a class="register_btn" href="<?=url::base();?>user/register">No account? Register now!</a>
<div class="register_form">
    <?php echo Request::subrequest('user/register')->execute()->response ?>
</div>
<?php endif ?>
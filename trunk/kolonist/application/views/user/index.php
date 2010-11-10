<?php if(Auth::instance()->logged_in()): ?>
<a href="/game.html">Rozpocznij grę</a><br/>
<a href="<?php echo url::site('user/logout') ?>">Wyloguj</a>
<?php else: ?>
<div class="login_form">
    <?php echo Request::subrequest('user/login')->execute()->response ?>
</div>
<div class="register_form">
    <?php echo Request::subrequest('user/register')->execute()->response ?>
</div>
<?php endif ?>
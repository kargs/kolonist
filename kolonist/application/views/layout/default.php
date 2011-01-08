<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Kolonist</title>
        <base href="<?php echo url::base(); ?>" />
        <link type="text/css" href="/css/ui-lightness/jquery-ui-1.8.5.custom.css" rel="stylesheet" />
        <link type="text/css" href="/css/style.css" rel="stylesheet"  />
        <script type="text/javascript" src="/js/jquery-1.4.3.js"></script>
        <script type="text/javascript" src="/js/jquery-ui-1.8.6.custom.min.js"></script>
        <script type="text/javascript" src="/js/script.js"></script>
    </head>
    <body class="body">
        <div class="mainWrapper">
            <div class="logo"></div>
            <ul class="menu">
                <li><a id="start" href="<?php echo url::site('welcome/index') ?>"></a></li>
                <li><a id="rules" href="<?php echo url::site('info/rules') ?>"></a></li>
                <li><a id="screens" href="<?php echo url::site('info/screens') ?>"></a></li>
                <li><a id="account" href="<?php echo url::site('user/index') ?>"></a></li>
            </ul>
            <div class="wrapper">
                <div class="mainContent">
                    <?php echo $content ?>
                </div>

            </div>
        </div>
        <div class="footer"><p>Copyright &copy; 2011 The Kolonist Team</p></div>
    </body>
</html>

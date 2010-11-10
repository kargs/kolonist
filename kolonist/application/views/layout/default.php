<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Kolonist</title>

        <link type="text/css" href="css/ui-lightness/jquery-ui-1.8.5.custom.css" rel="stylesheet" />
        <script type="text/javascript" src="js/jquery-1.4.3.js"></script>
        <script type="text/javascript" src="js/jquery-ui-1.8.5.custom.min.js"></script>

        <link href="<?= url::base();?>css/style.css" rel="stylesheet" type="text/css" />

    </head>
    <body class="body">
        <div class="mainWrapper">
            <div class="logo"></div>
            <ul class="menu">
                <li><a id="start" href="<?= url::base();?>"></a></li>
                <li><a id="rules" href="<?= url::base();?>welcome/rules/"></a></li>
                <li><a id="screens" href="<?= url::base();?>welcome/screens/"></a></li>
                <li><a id="account" href="<?= url::base();?>user/index/"></a></li>
            </ul>
            <div class="wrapper">
                <div class="mainContent">
                    <?php echo $content ?>
                </div>
                <div class="footer"></div>
            </div>
        </div>
    </body>
</html>

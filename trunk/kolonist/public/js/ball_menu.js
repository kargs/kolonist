$(function() {
    $('div.ball_item').mouseenter(function(e) {
        var count = $(this).children('div.ball_menu_item').size();
        var width = $(this).innerWidth();
        var height = $(this).innerHeight();
        var centerX = width/2;
        var centerY = height/2;
        var radius = 60;
        var radiusDelta = 20;
        var varriableRadiusElementCount = 7;
        var radiusHelper = 0;
        if(count >= varriableRadiusElementCount) {
            radius = 70;
            radiusHelper = 1;
        }
        $(this).children('div.ball_menu_item').each(function(i, obj){
            var alfa = i/count*Math.PI*2;
            radiusHelper = -1 * radiusHelper;
            var radiusTmp = radius + radiusHelper * radiusDelta;
            var x = radiusTmp * Math.cos(alfa);
            var y = radiusTmp * Math.sin(alfa);
            x += centerX - $(obj).innerWidth()/2;
            y += centerY - $(obj).innerHeight()/2;
            $(obj).delay(i*50).animate({
                left: x,
                top: y,
                opacity: 1
            });
        });

    });
    $('div.ball_item').mouseleave(function(e) {
        var position = $(this).children('div.ball_content').position();
        $(this).children('div.ball_menu_item').animate({
            top: position.top,
            left: position.left,
            opacity: 0.0
        });
    }).mouseleave();
});
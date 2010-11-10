$(function() {
    initBallMenu();
});
var initBallMenu = function(context) {
    if(context == undefined) {
        context = $(document);
    }
    $('div.ball_item', context).mouseenter(function(e) {
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
            $(obj).delay((i+1)*50).stop().animate({
                left: x,
                top: y,
                opacity: 1
            });
        });

    });
    $('div.ball_item', context).mouseleave(function(e) {
        var position = $(this).children('div.ball_content').position();
        $(this).children('div.ball_menu_item').stop().animate({
            top: position.top,
            left: position.left,
            opacity: 0.0
        });
    }).mouseleave();
}

//***************************************

function buildBallMenu(context, options, balls) {
    if(options.id == undefined) {
        options.id = 'menuBalls_'+Math.floor((Math.random()*100000));
    }
    r = '<div id="'+options.id+'" class="ball_item '+options.css+'" style="'+options.style+'">';
        r += '<div class="ball_content">';
        if(!(options.img == undefined)) {
            r += '<img src="'+options.img+'" alt="" />';
        }
        if(!(options.title == undefined)) {
            r += '<span>'+options.title+'</span>';
        }
        r += '</div>';

    $.each(balls, function(i, item) {
        if(item.id == undefined) {
            item.id = i;
        }
        var id = 'ball_'+options.id+'_'+item.id;
        r += '<div class="ball_menu_item '+id+' '+item.css+'" style="'+item.style+'">';
        r += '<a id="" href="#">';
        if(!(item.img == undefined)) {
        r += '<img src="'+item.img+'" alt=""/>';
        }
        if(!(item.title == undefined)) {
            r += '<span>'+item.title+'</span>';
        }
        r += '</a></div>';
    });


    r += '</div>';
    $(context).html(r);
    initBallMenu(context);
}





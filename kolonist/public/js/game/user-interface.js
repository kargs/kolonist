$(function(){
    $('#top').mouseenter(function(){
        $('.logo').animate({
            left: 0
        }, 200);
        $(this).stop().animate({
            top: 0
        }, 200);
        $('.top_content *', this).stop().animate({
            opacity: 1.0
        });
    }).mouseleave(function(){
        $('.logo').animate({
            left: -200
        }, 200);
        $(this).stop().animate({
            top: -30
        });
        $('.top_content *', this).stop().animate({
            opacity: 0.0
        });
    });
    $('#top #menu a').button({
        height: 30
    });

    //------------------------------------------
    // My provinces
    //------------------------------------------
    $('.myProvincesButton').click(function(event) {
        event.preventDefault();
        $('div#myProvincesDialog').dialog('open');
    });
    $('div#myProvincesDialog').dialog({
        autoOpen: false,
        position: 'left',
        title: 'List of my provinces',
        resizable: false,
        width: 200,
        height: 300
    });
    $('div#myProvincesDialog div.myProvincesList li').live('click', function(event) {
        event.preventDefault();
        var id = $(this).attr('rel');
        centerProvince(id);
    });



    //------------------------------------------
    
    $('#btn').click(function(e){
        var x = $('#px').val();
        var y = $('#py').val();
        moveTo(x, y);
//        initMap();
    });
    $('#left').click(function() {
        positionX += Math.abs($('#inc').val());
        positionX = Math.abs(positionX %mapWidth);
        $('#px').val(positionX);
        $('#py').val(positionY);
        initMap();
    });
    $('#right').click(function() {
        positionX -= Math.abs($('#inc').val());
        if(positionX < 0) {
            positionX = mapWidth + positionX;
        }
        $('#px').val(positionX);
        $('#py').val(positionY);
        initMap();
    });
    $('#up').click(function() {
        positionY += Math.abs($('#inc').val());
        positionY = Math.abs(positionY % mapHeight);
        $('#px').val(positionX);
        $('#py').val(positionY);
        initMap();
    });
    $('#down').click(function() {
        positionY -= Math.abs($('#inc').val());
        if(positionY < 0) {
            positionY = mapHeight + positionY;
        }
        $('#px').val(positionX);
        $('#py').val(positionY);
        initMap();
    });
});
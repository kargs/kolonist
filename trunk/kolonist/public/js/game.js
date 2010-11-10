var provinces;
var mapWidth = 800;
var mapHeight = 500;
var scale = 100;
var cache;
var positionX = 10;
var positionY = 10;
var bufferLeftSize = 715;
var bufferRightSize = 100;
var bufferTopSize = 445;
var bufferBottomSize = 100;

$(function() {

    for(i=1; i<=5; i++) {
        buildBallMenu($('#slot'+i), {
            title: 'Slot #'+i,
            css: 'test',
            style: 'color:orange'
        },
        [
        {
            title: 'Pozycja #1'
        },
        {
            title: 'Pozycja #2'
        },
        {
            title: 'Pozycja #3'
        }
        ]);
    }

    $('#top #menu a').button({
        height: 30
    });
    $('#provinceView').dialog({
        //        autoOpen: false,
        modal: true,
        resizable: false,
        width: 760,
        height: 550,
        dragStop: function() {
            alert($(this).parents('.ui-dialog').css('top'));
        },
        //        width: $(document).width()-200,
        //        position: [100, 50],
        show: 'clip',
        hide: 'fold'

    });
    $('#buildingSelected').dialog({
        autoOpen: false,
        modal: true
    });
    $.ajax({
        url: 'provinces.txt',
        success: function(data) {
            var r = null;
            r = eval(data);
            provinces = new Array();
            $.each(r, function(i, p) {
                if(!(p === undefined)) {    // hack for ie
                    provinces[i] = p;
                }
            });
            buildCache();
            initMap();
        }
    });

    // uaktywnienie wartswy do przeciągania
    $('.moveHandle').click(function(e){
        $('#mapdrag').slideUp();
        $('#mapdrag').css('display', 'block');
        e.preventDefault();
    });
    

    // przesuwanie warstwy do przesuwania
    var mouseXdelta = 0; // przyrosty wspolrzednych
    var mouseYdelta = 0;
    $('div#mapdrag').draggable({
        refreshPositions: false,
        start: function(event, ui) {
            mouseXdelta = ui.offset.left;
            mouseYdelta = ui.offset.top;
        },
        stop: function(event, ui) {
            $('div#mapdrag').css('top', '0');
            $('div#mapdrag').css('left', '0');
            $('div#map').css('left', 0).css('top', 0);
            initMap();
        },
        drag: function(event, ui) {
            var diffX = ui.offset.left - mouseXdelta;
            var diffY = ui.offset.top - mouseYdelta;
            mouseXdelta = ui.offset.left;
            mouseYdelta = ui.offset.top;

            positionX -= diffX;
            if(positionX < 0) {
                positionX = mapWidth + positionX;
            } else {
                positionX %= mapWidth;
            }
            positionY -= diffY;
            if(positionY < 0) {
                positionY = mapHeight + positionY;
            } else {
                positionY %= mapHeight;
            }
            $('#px').val(positionX);
            $('#py').val(positionY);
            $('div#map').css('left',  ui.offset.left).css('top',  ui.offset.top);
        }
    });
});
function showProvince(id) {
    $('#provinceView').dialog('option', 'title', 'Provincja '+id);
    //    $('#provinceView').dialog('option', 'hide', {effect: 'drop', direction: 'right'});
    $('#provinceView').dialog('open');
}
function showBuilding() {
    $('#buildingSelected').dialog('open');
}
function buildCache() {
    var dimenstion2 = Math.floor(mapHeight/scale);
    cache = new Array(Math.floor(mapWidth/scale));
    for(i=0; i < cache.length; i++) {
        cache[i] = new Array(dimenstion2);
        for(j=0; j< dimenstion2; j++) {
            cache[i][j] = new Array();
        }
    }
    $.each(provinces, function(i, p){
        var x = Math.floor(p.start.x/scale);
        var y = Math.floor(p.start.y/scale);
        var len = cache[x][y].length;
        cache[x][y][len] = p;
    });
}
function initMap() {
    //    $('#map').empty();    //faster
    var px = positionX;
    var py = positionY;
    var spx = Math.floor(px/scale);
    var spy = Math.floor(py/scale);
    var smw = Math.floor(mapWidth/scale);
    var smh = Math.floor(mapHeight/scale);
    var aw = $('#map').width() + bufferLeftSize + bufferRightSize;
    var ah = $('#map').height() + bufferTopSize + bufferBottomSize;
    var saw = Math.floor(aw/scale);
    var sah = Math.floor(ah/scale);
    var skx = spx + saw;
    var sky = spy + sah;
    var map = '';
    var maparea = '';
    //    var ballMenu = '';
    var i, ii, j, jj, ip=0, jp=0, ifst=false, jfst=false;
    for(i=spx; i <= skx; i++) {
        ii = i % smw;
        if(ifst && ii == 0) ip++;
        ifst = true;
        jp = 0;
        jfst = false;
        for(j=spy; j <= sky; j++) {
            jj = j % smh;
            if(jfst && jj == 0) jp++;
            jfst = true;
            $.each(cache[ii][jj], function(index, p){
                var x = p.start.x - px + ip*mapWidth - bufferLeftSize;
                var y = p.start.y - py + jp*mapHeight - bufferTopSize;
                //                $('#map').append('<img style="left: '+(x)+'px; top: '+(y)+'px;" src="maps/p'+p.id+'.png" alt="Provincja" class="province" />');   // faster
                map += '<img style="left: '+(x)+'px; top: '+(y)+'px;" src="maps/p'+p.id+'.png" alt="Provincja" class="province province-'+p.id+'" />';
                maparea += '<area shape="poly" rel="'+p.id+'" href="#'+p.id+'" coords="';
                $.each(p.points, function(i, point){
                    if(point === undefined) {
                        return;
                    }
                    if(i != 0) {
                        maparea += ',';
                    }
                    maparea += (point.x + x)+','+(point.y + y);
                });
                maparea += '" />';
            //                ballMenu += '<div style="top:'+(y+10)+'px; left:'+(x+10)+'px;" class="ball_item"><div class="ball_content">KAM<br/>karo</div>';
            //                ballMenu += '<div class="ball_menu_item"> <a href="#"><img src="" alt="Pozycja 1"/></a></div></div>';
            });
        }
    }
    $('#map').empty();
    $('#map').append(map);
    //    $('#mapMenuBall').html(ballMenu);
    //    initBallMenu();
    $('#mapareaitems').empty().append(maparea);
    $('#mapareaitems area').mouseover(function (e) {
        var id = $(this).attr('rel');
        $('#map .province-'+id).addClass('province-hover');
    }).mouseout(function(e) {
        var id = $(this).attr('rel');
        $('#map .province-'+id).removeClass('province-hover');
    });

    // włączenie widoku provincji
    $('#mapareaitems area').dblclick(function(event) {
        event.preventDefault();
        showProvince($(this).attr('rel'));
    });
    
    var mouseX = 0;
    var mouseY = 0;
    $('#mapareaitems area').draggable({
        //        refreshPositions: false,
        //        grid: [5, 5],
        start: function(event, ui) {
            mouseX = ui.offset.left;
            mouseY = ui.offset.top;
        },
        stop: function(event, ui) {
            $('div#mapdrag').css('top', '0');
            $('div#mapdrag').css('left', '0');
            $('div#map').css('left', 0).css('top', 0);
            initMap();
        },
        drag: function(event, ui) {
            var diffX = ui.offset.left - mouseX;
            var diffY = ui.offset.top - mouseY;
            mouseX = ui.offset.left;
            mouseY = ui.offset.top;

            positionX -= diffX;
            if(positionX < 0) {
                positionX = mapWidth + positionX;
            } else {
                positionX %= mapWidth;
            }
            positionY -= diffY;
            if(positionY < 0) {
                positionY = mapHeight + positionY;
            } else {
                positionY %= mapHeight;
            }
            $('#px').val(positionX);
            $('#py').val(positionY);
            $('div#map').css('left',  ui.offset.left).css('top',  ui.offset.top);
        }
    });
}


$(function() {
    $('#btn').click(function(e){
        positionX = $('#px').val();
        positionY = $('#py').val();
        initMap();
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
var provinces;
var provincesAsoc;
var mapWidth = 3000;
var mapHeight = 3000;
var scale = 100;
var cache;
var bufferLeftSize = 1215;
var bufferRightSize = 800;
var bufferTopSize = 645;
var bufferBottomSize = 400;
var positionX = mapWidth - bufferLeftSize;
var positionY = mapHeight - bufferTopSize;


/**
 * przechodzi do pozycji gdzie punkt na mapie (x,y) jest na środku ekranu
 */
function moveTo(x, y) {
    x = parseInt(x);
    y = parseInt(y);
    var wndW = $(document).width()/2;
    var wndH = $(document).height()/2;
    var nx = (mapWidth - bufferLeftSize + x)%mapWidth - wndW;
    var ny = (mapHeight - bufferTopSize + y)%mapWidth - wndH;
    //@todo animacja
    positionX = nx;
    positionY = ny;
    initMap();
}

/**
 * centruje procvincje
 * @param id id prowincji
 */
function centerProvince(id) {
    var p = provincesAsoc[id];
    var cx = Math.round((p.start.x + p.end.x ) / 2);
    var cy = Math.round((p.start.y + p.end.y ) / 2);
    moveTo(cx, cy);
}

$(function(){
    $.ajax({
        url: 'provinces.txt',
        success: function(data) {
            var r = null;
            r = eval(data);
            provinces = new Array();
            provincesAsoc = new Array();
            $.each(r, function(i, p) {
                if(!(p === undefined)) {    // hack for ie
                    p.owner = new Object();
                    p.owner.id = null;
                    p.owner.nickname = null;
                    p.name = '';
                    provinces[i] = p;
                    provincesAsoc[p.id] = p;
                }
            });
            buildCache();
            initMap();
            setCurrentProgress('provinces');
        }
    });

//    $('.detectArea').mousemove(function(event) {
//        var x = event.pageX;
//        var y = event.pageY;
//        if($(this).is('.daLeft')) {
//            x = 10;
//        }
//        $('.movePointItem').css('top', y);
//        $('.movePointItem').css('left', x);
//        $('.movePointItem').stop().delay(1000).fadeIn();
//    }).mouseout(function(event) {
//        $('.movePointItem').delay(1100).stop().faceOut(function() {
//            $(this).stop().fadeOut();
//        });
//    });

    // uaktywnienie wartswy do przeciągania
    $('.moveHandle').click(function(e){
        if($('#mapdrag').is(':visible')) {
            mapareaHide()
        } else {
            mapareaShow();
        }
        e.preventDefault();
    });

    $('#mapareaitems area').live('dblclick', function(event) {
        event.preventDefault();
        mapareaShow();
    });

    // przesuwanie warstwy do przesuwania
    var mouseXdelta = 0; // przyrosty wspolrzednych
    var mouseYdelta = 0;
    $('div#mapdrag').dblclick(function(event){
        $(this).slideUp();
        $('.mapdragLayer').slideUp();
    }).draggable({
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

function mapareaShow() {
    $('#mapdrag').slideDown();
    $('.mapdragLayer').slideDown();
}
function mapareaHide() {
    $('#mapdrag').slideUp();
    $('.mapdragLayer').slideUp();
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
    if(cache === undefined) {
        return;
    }
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
                var color = 'normal';
                if(!(p.owner === undefined)) {
                    if(p.owner.id == userId) {
                        color = 'owner';
                    } else if(p.owner.id != null) {
                        color = 'enemy';
                    }
                }
                var w = p.end.x - p.start.x;
                var h = p.end.y - p.start.y;
                var labelX = x;
                var labelY = y;
                var paddingTop = h/2;
                var provinceName = p.name;
                var ownerName = translate('free');
                if(!(p.owner.nickname === undefined) && p.owner.nickname != null) {
                    ownerName = p.owner.nickname;
                }
                map += '<img style="left: '+(x)+'px; top: '+(y)+'px;" src="maps/'+color+'/p'+p.id+'.png" alt="" class="province province-'+p.id+'" />';
                map += '<div class="provinceInfo" style="padding-top: '+paddingTop+'px; left: '+(labelX)+'px; top: '+(labelY)+'px; width: '+w+'px; height: '+h+'px;"><div class="pName">'+provinceName+'</div><div class="pOwner">'+ownerName+'</div></div>';
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
    $('#mapareaitems area').click(function(event) {
        event.preventDefault();
        showProvince($(this).attr('rel'));
    });

    var mouseX = 0;
    var mouseY = 0;
    if(!window.opera) { // disable dragging in opera
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
}


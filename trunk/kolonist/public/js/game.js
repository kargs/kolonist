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
    $('#top #menu a').button({
        height: 30
    });
    $('#provinceView').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: $(document).width()-200,
        //        position: [100, 50],
        show: 'explode',
        hide: 'explode'

    });
    $('#buildingSelected').dialog({
        autoOpen: false,
        modal: true
    });
//    $.getJSON('/provinces.json', {}, function(data, textStatus){  // dziala tylko w ff
//        provinces = data;
//        buildCache();
//        initMap();
//    });
    $.ajax({
        url: '/provinces.txt',
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
    var mouseX = 0;
    var mouseY = 0;
    var initEnable = true;
    $('div#mapdrag').draggable({
        refreshPositions: false,
        grid: [5, 5],
        start: function(event, ui) {
            mouseX = ui.offset.left;
            mouseY = ui.offset.top;
        },
        stop: function(event, ui) {
            $('div#mapdrag').css('top', '0');
            $('div#mapdrag').css('left', '0');
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
            if(initEnable) {
                initEnable = false;
                initMap();
                initEnable = true;
            }
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
            });
        }
    }
    $('#map').empty();
    $('#map').append(map);
    $('#mapareaitems').empty().append(maparea);
    $('#mapareaitems area').mouseover(function (e) {
        var id = $(this).attr('rel');
        $('#map .province-'+id).addClass('province-hover');
    }).mouseout(function(e) {
        var id = $(this).attr('rel');
        $('#map .province-'+id).removeClass('province-hover');
    });
    var mouseX = 0;
    var mouseY = 0;
    $('#mapareaitems area').draggable({
        refreshPositions: false,
        grid: [5, 5],
        start: function(event, ui) {
            mouseX = ui.offset.left;
            mouseY = ui.offset.top;
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
            if(initEnable) {
                initEnable = false;
                initMap();
                initEnable = true;
            }
        }
    });
}
var initEnable = true;

function _initMap() {
    $('#map').empty();
    var mapViewX = 10;
    var mapViewY = 10;
    var startX = Math.floor(mapViewX/scale);
    var startY = Math.floor(mapViewY/scale);
    var Ws = Math.floor(mapWidth/scale);
    var Hs = Math.floor(mapHeight/scale);
    var bufferWidthS = Math.floor(($(document).width() + 20)/scale);
    var bufferHeightS = Math.floor(($(document).height() + 20)/scale);
    var i=startX;
    var k=startY;
    var dx = 0;
    var dy = 0;
    for(j=0; j<bufferWidthS; j++) {
        dy = 0;
        for(m=0; m<bufferHeightS; m++) {
            $.each(cache[i][k], function(index, province){
                var tmpX = province.start.x-mapViewX + (dx);
                var tmpY = province.start.y-mapViewY + (dy);
                $('#map').append('<img style="left: '+(tmpX)+'px; top: '+(tmpY)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
            });
            k = (k+1) % Hs;
            if(k ==0) {
                dy = mapHeight;
            }
        }
        i = (i+1) % Ws;
        if(i == 0) {
            dx = mapWidth;
        }
    }
//    $.each(provinces, function(i, province){
//        $('#map').append('<img style="left: '+province.start.x+'px; top: '+province.start.y+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//        $('#map').append('<img style="left: '+(province.start.x+mapWidth)+'px; top: '+(province.start.y)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//        $('#map').append('<img style="left: '+(province.start.x+mapWidth)+'px; top: '+(province.start.y+mapHeight)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//        $('#map').append('<img style="left: '+(province.start.x)+'px; top: '+(province.start.y+mapHeight)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//        $('#map').append('<img style="left: '+(province.start.x-mapWidth)+'px; top: '+(province.start.y)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//        $('#map').append('<img style="left: '+(province.start.x-mapWidth)+'px; top: '+(province.start.y-mapHeight)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//        $('#map').append('<img style="left: '+(province.start.x)+'px; top: '+(province.start.y-mapHeight)+'px;" src="maps/p'+province.id+'.png" alt="Provincja" class="province" />');
//    });
}
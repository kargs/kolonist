// bardzo powiazane z province.js
// moze warto robic tutaj funkcje, ktore beda uzywane w province
// ale wczytanie budynkow do cache jest tutaj

var buildings;


$(function() {
    $.ajax({
        url: 'json/getbuildingstats',
        success: function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            buildings = new Array();
            $.each(r.content, function(i, b) {
                if(!(b === undefined)) {    // hack for ie
                    if(buildings[b.type] === undefined) {
                        buildings[b.type] = new Array();
                    }
                    buildings[b.type][b.level] = b;
                }
            });
            setCurrentProgress('buildings');
        }
    });

    $('div#buildingView').dialog({
        autoOpen: false,
        resizable: false,
        width: 430,
        height: 430
    });
});

function showBuilding(province_id, building) {
    $('div#buildingView div.buildingDetail').css('display', 'none');
    var $bv = $('div#buildingView div.buildingDetail');
    $bv.css('display', 'block');
    $('.workers', $bv).html(building.workers);
    $('.increaseWorkers', $bv).click(function(event) {
        event.preventDefault();
        var workersCnt = parseInt(building.workers) + 1;
        $.get('json/attachworkers/'+province_id+'/'+building.slot_index+'/'+workersCnt, function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            building.workers = workersCnt;
            $('.workers', $bv).html(workersCnt);
        });
    });
    
    $('.decreaseWorkers', $bv).click(function(event) {
        event.preventDefault();
        var workersCnt = parseInt(building.workers) - 1;
        $.get('json/attachworkers/'+province_id+'/'+building.slot_index+'/'+workersCnt, function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            building.workers = workersCnt;
            $('.workers', $bv).html(workersCnt);
        });
    });

    $('div#buildingView').dialog('open');
}
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
        modal: true,
        width: 430,
        height: 430
    });

    $('div#buildingChooser').dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        title: translate('buildingChooser'),
        height: 450,
        width: 530,
        open: function() {
            $('button', this).button();
        }
    });

    $('div#buildingUpgrader').dialog({
        autoOpen: false,
        resizable: true,
        modal: true,
        title: translate('buildingUpgrader'),
        height: 500,
        width: 530,
        open: function() {
            $('button', this).button();
        }
    });

    $('div#buildingChooser .buildItem .more span').live('click', function(event) {
        var $elem = $(this);
        $elem.parents('.buildItem').children('.extendInfo').slideToggle(function() {
            $elem.removeClass('ui-icon-circle-triangle-s').removeClass('ui-icon-circle-triangle-n');
            if($elem.is('.expanded')) {
                $elem.addClass('ui-icon-circle-triangle-s');
                $elem.removeClass('expanded');
            } else {
                $elem.addClass('ui-icon-circle-triangle-n');
                $elem.addClass('expanded');
            }
        });
    });
    $('div#buildingChooser .buildItem .buildAction').live('click', function() {
        var $btn = $(this);
        var pid = $btn.attr('pid');
        var sid = $btn.attr('sid');
        var bid = $btn.attr('bid');
        var btype = $btn.attr('btype');
        createBuilding(pid, sid, btype);
        $('div#buildingChooser').dialog('close');
    });
});

/**
 * @return true | Array of missed resource: [resourceName] = 4; (cnt missed)
 */
function _isBuildAble(building, resources) {
    var m = new Array();
    var flag = false;
    for(var ri in resources) {
        var r = resources[ri];
        var br = building[ri+'_requirement'];
        var d = br - r;
        if(d > 0) {
            m[ri] = d;
            flag = true;
        }
    }
    if(flag) {
        return m;
    }
    return true;
}

function showBuildingUpgrader(provinceId, building, resources) {
    var b0 = buildings[building.type][building.level];
    var b1 = buildings[building.type][parseInt(building.level)+1];
    var isMaxLevel = false;
    if(b1 === undefined) {
        isMaxLevel = true;
    }
    var bable = _isBuildAble(b1, resources);
    var isUpgradeAble = !isArray(bable);
    var $dlg = $('div#buildingUpgrader');
    if(isUpgradeAble) {
        $('.upgrader', $dlg).removeClass('noRes');
    } else {
        $('.upgrader', $dlg).addClass('noRes');
    }
    $('.type', $dlg).html(translate(b0.type));
    $('.level', $dlg).html(translate(b0.level));
    $('.avatar img', $dlg).attr('src', '/graph/buildings/'+b0.type+'.png');
    var html = '';
    if(isMaxLevel) {
        $('.upgrader', $dlg).addClass('maxLevel');
        html += translate('buildingMaxLevelAchieved');
    } else {
        $('.upgradeAction', $dlg).html(translate('upgradeBuilding'));
        html = '<table class="requTable">';
        var emptyRequ = true;
        for(var ri in b1) {
            if(ri.indexOf('_requirement') >= 0 && b1[ri] > 0) {
                emptyRequ = false;
                html += '<tr><td class="requName">'+translate(ri)+'</td><td class="requValue">'+b1[ri]+'</td><td class="requLack">';
                var propname = ri.replace('_requirement', '');
                if(!(bable[propname] === undefined)) {
                    html += '<div>('+bable[propname]+' '+translate('lacks')+')</div>';
                }
                html += '</td></tr>';
            }
        }
        if(emptyRequ) {
            html += '<tr><td>'+translate('anyRequirements')+'</td></tr>';
        }
        html += '</table>';
    }
    $('.requItems', $dlg).html(html);

    // comparer
    html = '<div class="cmpGain"><table><thead><tr><td>'+translate('buildingChooser_gain')+'</td><td>'+translate('level')+'&nbsp;'+b0.level+'</td>';
    if(!isMaxLevel) {
        html += '<td>'+translate('level')+'&nbsp;'+b1.level+'</td>';
    }
    html += '</tr></thead><tbody>';
    for(var gi in b0) {
        if(gi.indexOf('_gain') >= 0) {
            html += '<tr><td>'+translate(gi)+'</td><td>'+b0[gi]+'</td>';
            if(!isMaxLevel) {
                html += '<td>'+b1[gi]+'</td>';
            }
            html += '</tr>';
        }
    }
    html += '</tbody></table></div>';

    html += '<div class="cmpMax"><table><thead><tr><td>'+translate('buildingChooser_capacity')+'</td><td>'+translate('level')+'&nbsp;'+b0.level+'</td>';
    if(!isMaxLevel) {
        html += '<td>'+translate('level')+'&nbsp;'+b1.level+'</td>';
    }
    html += '</tr></thead><tbody>';
    for(var gi in b0) {
        if(gi.indexOf('_max') >= 0) {
            html += '<tr><td>'+translate(gi)+'</td><td>'+b0[gi]+'</td>';
            if(!isMaxLevel) {
                html += '<td>'+b1[gi]+'</td>';
            }
            html += '</tr>';
        }
    }
    html += '</tbody></table></div>';

    html += '<div class="cmpOther"><table><thead><tr><td>'+translate('buildingChooser_other')+'</td><td>'+translate('level')+'&nbsp;'+b0.level+'</td>';
    if(!isMaxLevel) {
        html += '<td>'+translate('level')+'&nbsp;'+b1.level+'</td>';
    }
    html += '</tr></thead><tbody>';
    html += '<tr><td>'+translate('defense')+'</td><td>'+b0.defense+'</td>';
    if(!isMaxLevel) {
        html += '<td>'+b1.defense+'</td>';
    }
    html += '</tr>';
    html += '<tr><td>'+translate('food_by_worker')+'</td><td>'+b0.food_by_worker+'</td>';
    if(!isMaxLevel) {
        html += '<td>'+b1.food_by_worker+'</td>';
    }
    html += '</tr>';


    html += '</tbody></table></div>';

    $('.comparer', $dlg).html(html);
    $('div#buildingUpgrader').dialog('open');
}

function showBuildingChooser(provinceId, params) {
    var html = '';
    for(var type in buildings) {
        var b = buildings[type];
        var bable = _isBuildAble(b[1], params.resources);
        html += '<div class="buildItem'+(isArray(bable) ? ' noRes':'')+'">';
        html += '<div class="left">';
        html += '<div class="avatar"><img src="/graph/buildings/'+type+'.png" alt="" /></div>';
        html += '<div class="type">'+translate(type)+'</div>';
        html += '</div>';
        html += '<div class="info">';
        html += '<button class="buildActionButton buildAction" sid="'+params.slotIndex+'" pid="'+provinceId+'" btype="'+type+'" bid="'+b[1].id+'">'+translate('buildAction')+'</button>';
        html += '<h2>'+translate('buildingChooser_requirement')+'</h2>';
        html += '<table class="requTable">';
        var emptyRequ = true;
        for(var ri in b[1]) {
            if(ri.indexOf('_requirement') >= 0 && b[1][ri] > 0) {
                emptyRequ = false;
                html += '<tr><td class="requName">'+translate(ri)+'</td><td class="requValue">'+b[1][ri]+'</td><td class="requLack">';
                var propname = ri.replace('_requirement', '');
                if(!(bable[propname] === undefined)) {
                    html += '<div>('+bable[propname]+' '+translate('lacks')+')</div>';
                }
                html += '</td></tr>';
            }
        }
        if(emptyRequ) {
            html += '<tr><td>'+translate('anyRequirements')+'</td></tr>';
        }
        html += '</table>';
        html += '<br class="clear"/><div class="more"><span class="ui-icon ui-icon-circle-triangle-s"></span></div>';
        html += '</div>';
        html += '<div class="extendInfo">';
        html += '<div class="extTable extGain"><table><tr><td colspan="2">'+translate('buildingChooser_gain')+'</td></tr>';
        for(var pi in b[1]) {
            if(pi.indexOf('_gain') >= 0) {
                html += '<tr><td class="key">'+translate(pi)+'</td><td class="value">'+b[1][pi]+'</td></tr>';
            }
        }
        html += '</table></div>';

        html += '<div class="extTable extCapacity"><table><tr><td colspan="2">'+translate('buildingChooser_capacity')+'</td></tr>';
        for(var pi in b[1]) {
            if(pi.indexOf('_max') >= 0) {
                html += '<tr><td class="key">'+translate(pi)+'</td><td class="value">'+b[1][pi]+'</td></tr>';
            }
        }
        html += '</table></div>';

        html += '<div class="extTable extOther"><table><tr><td colspan="2">'+translate('buildingChooser_other')+'</td></tr>';
        html += '<tr><td class="key">'+translate('defense')+'</td><td class="value">'+b[1].defense+'</td></tr>';
        html += '<tr><td class="key">'+translate('food_by_worker')+'</td><td class="value">'+b[1].food_by_worker+'</td></tr>';
        html += '</table></div>';
        html += '<br class="clear"/></div>';
        html += '<br class="clear"/></div>';
    }
    $('div#buildingChooser .buildingsList').html(html);
    $('div#buildingChooser').dialog('open');
}

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
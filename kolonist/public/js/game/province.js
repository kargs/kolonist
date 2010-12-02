var selectedProvince = null;

$(function() {
    $('#provinceView').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: 760,
        height: 550,
        //        dragStop: function() {
        //            alert($(this).parents('.ui-dialog').css('top'));
        //        },
        beforeClose: function(event, ui) {
            selectedProvince = null;
        },
        show: 'clip',
        hide: 'fold'
    });
});

function showProvince(id) {
    if(provincesAsoc[id].owner.id != userId) {
        return;
    }
    $('#provinceView .loaded').css('display', 'none');
    $('#provinceView .loading').css('display', 'block');

    updateProvince(id);

    $('#provinceView').dialog('open');
}

function updateProvince(id) {
    $.ajax({
        url: 'json/getprovinceinfo/'+id,
        success: function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            var p = selectedProvince = r.content;
            var resources = p.resources;
            for (var resName in resources) {
                $('div#provinceView .resourcesbar .'+resName).html(resources[resName]);
            }
            var slots = new Array();
            for(var i=0; i< slotMax; i++) {
                slots[i] = null;
            }
            $.each(p.slots, function(i, s) {
                if(!(s === undefined)) {    // hack for ie
                    var b = s.building;
                    slots[b.slot_index] = new Object();
                    var balls = new Array();
                    balls[balls.length] = {
                        css: 'bgtoggle develop',
                        title: 'Upgrade to '+(1 + parseInt(b.level)),
                        params: [p.id, b.slot_index],
                        click: function (e, params) {
                            upgradeBuilding(params[0], params[1]);
                        }
                    }
                    balls[balls.length] = {
                        css: 'bgtoggle develop',
                        title: 'More',
                        params: [p.id, b],
                        click: function (e, params) {
                            showBuilding(params[0], params[1]);
                        }
                    }
                    balls[balls.length] = {
                        css: 'bgtoggle develop',
                        title: 'Destroy',
                        params: [p.id, b.slot_index],
                        click: function (e, params) {
                            destroyBuilding(params[0], params[1]);
                        }
                    }

                    slots[b.slot_index].balls = balls;
                    slots[b.slot_index].img = 'graph/buildings/'+b.type+'.png';

                }
            });
            for(var i=0; i < slotMax; i++) {
                var balls = new Array();
                var img = 'graphics/slot.png';
                if(slots[i] == null) {  // domyślne budynki
                    for (var bname in buildings) {
                        // sprawdzać ilość resourców
                        balls[balls.length] = {
                            css: 'bgtoggle develop',
                            title: 'Build '+bname,
                            params: [p.id, i, bname],
                            click: function (e, params) {
                                createBuilding(params[0], params[1], params[2]);
                            }
                        }
                    }
                } else {
                    balls = slots[i].balls;
                    img = slots[i].img;
                }
                buildBallMenu($('#slot'+i), {
                    img: img,
                    css: 'test',
                    style: 'color:orange'
                }, balls);
            }
            $('#provinceView').dialog('option', 'title', 'Province '+p.name);
            $('#provinceView .loading').fadeOut(function(){
                $('#provinceView .loaded').fadeIn();
            });
        }
    });
}

function createBuilding(province_id, slot_index, building_type) {
    $.get('json/createbuilding/'+province_id+'/'+slot_index+'/'+building_type, function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            return;
        }
        updateProvince(province_id);
    });
}
function upgradeBuilding(province_id, slot_index) {
    $.get('json/upgradebuilding/'+province_id+'/'+slot_index, function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            return;
        }
        updateProvince(province_id);
    });
}
function destroyBuilding(province_id, slot_index) {
    $.get('json/destroybuilding/'+province_id+'/'+slot_index, function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            return;
        }
        updateProvince(province_id);
    });
}


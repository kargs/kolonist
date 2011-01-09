var selectedProvince = null;

$(function() {
    $('#provinceView').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: 740,
        height: 570,
        //        dragStop: function() {
        //            alert($(this).parents('.ui-dialog').css('top'));
        //        },
        beforeClose: function(event, ui) {
            selectedProvince = null;
        },
        show: 'clip',
        hide: 'fold'
    });

    $('#enemyDialog').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        show: 'clip',
        hide: 'fold',
        title: 'Foreign province'
    });

    $('#battleResultDialog').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        show: 'clip',
        hide: 'fold',
        title: 'Battle Result'
    });


    $('#enemyDialog .battle input.battleBtn').button().click(function(event){
        event.preventDefault();
        var data = new Array();
        var sum = 0;
        $('#enemyDialog .battle td div.sliderInfo').each(function(i, item){
            var q = new Object();
            q.army = parseInt($('input.slider_'+i+'_value', item).val());
            if(q.army <=0 ) {
                return;
            }
            sum += q.army;
            q.provinceId = $('input.province_id', item).val();
            data[data.length] = q;
        });
        if(sum <= 0) {
            processError('noArmySelected', 'Choose your soldier to fight.');
            return;
        }
        $.post('json/fight/'+$(this).attr('pid'), {
            data: data
        }, function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            r = r.content;
            var $battle = $('#battleResultDialog');
            if(r.won) {
                $('.won', $battle).css('display', 'block');
                $('.lost', $battle).css('display', 'none');
                progressFinisfed['world'] = false;
                processGameState();
            } else {
                $('.won', $battle).css('display', 'none');
                $('.lost', $battle).css('display', 'block');
            }
            var html = '';
            $.each(r.losts ? r.losts : [], function(i, item) {
                html += '<tr><td>'+provincesAsoc[item.provinceId].name+'</td><td>';
                html += 'lost '+item.armylost+' soldier(s).';
                html += '</td></tr>';
            });
            $('table tbody', $battle).html(html);

			var youLost = Math.round(parseFloat(r.lostDecimal)*100);
            var soldiersLost = Math.round(parseFloat(r.soldiersLost));
			var attack = Math.round(parseFloat(r.attack));
			var enemySoldiersLost = Math.round(parseFloat(r.victimLosts));
			var buildingsDefenseRatio = Math.round(parseFloat(r.buildingsDefenseRatio)*100);
			var ratioInformation = r.ratioInformation;
			var luckInformation = r.luckInformation;

            $('#battleResultDialog .yourLost').html(youLost);
			$('#battleResultDialog .soldiersLost').html(soldiersLost);
			$('#battleResultDialog .attack').html(attack);
			$('#battleResultDialog .enemySoldiersLost').html(enemySoldiersLost);
			$('#battleResultDialog .buildingsDefenseRatio').html(buildingsDefenseRatio);
			$('#battleResultDialog .ratioInformation').html(ratioInformation);
			$('#battleResultDialog .luckInformation').html(luckInformation);

            $('#enemyDialog').dialog('close');
            $('#battleResultDialog').dialog('open');
        });
    });

    $('#moveSoildiersDlg').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        title: translate('armyMove')
    });
    $('.armySlider').slider({
        min: 0,
        slide: function(event, ui) {
            $('#moveSoildiersDlg .armySliderVal').val(ui.value);
        }
    });
    $('.showSoildierMoveDlg').live('click', function(event){
        event.preventDefault();
        var pid = $(this).attr('pid');
        var soldiers = $(this).attr('soldiers');
        showSoildiersMoveDialog(pid, soldiers);
    });
    $('#moveSoildiersDlg .moveArmyAction').live('click', function(event) {
        event.preventDefault();
        var pid = $('#moveSoildiersDlg .maPid').val();
        var sld = $('#moveSoildiersDlg .armySliderVal').val();
        var npid = $('#moveSoildiersDlg .provinceChoose').val();
        $.get('json/movesoldiers/'+pid+'/'+npid+'/'+sld, function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            updateProvince(pid);
            processInfo(r.status.code, r.status.message);
            $('#moveSoildiersDlg').dialog('close');
        });
    });

    $('.showProvNameChangeDlg').live('click', function(event) {
        event.preventDefault();
        var pid = $(this).attr('pid');
        var name = provincesAsoc[pid].name;
        $('#nameChangerDlg .provName').val(name);
        $('#nameChangerDlg').dialog('open');
    });

    $('#nameChangerDlg').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        title: translate('changeProvinceNameTitle')
    });
    $('#nameChangerDlg .changeNameAction').live('click', function(event) {
        event.preventDefault();
        var pid = $(this).attr('pid');
        var name = $('#nameChangerDlg .provName').val();
        $.get('json/changeprovincename/'+pid+'/'+name, function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            updateProvince(pid);
            processGameState();
            processInfo(r.status.code, r.status.message);
            $('#nameChangerDlg').dialog('close');
        });
    });
    

});

function showSoildiersMoveDialog(pid, armyCnt) {
    $('#moveSoildiersDlg .armySlider').slider('option', 'value', 0);
    $('#moveSoildiersDlg .armySlider').slider('option', 'max', armyCnt);
    $('#moveSoildiersDlg .armyCnt').html(armyCnt);
    var html = '';
    $.each(provinces, function(i, p) {
        if(p.owner.id != userId) return;
        html += '<option value="'+p.id+'">'+p.name+'</option>';
    });
    $('#moveSoildiersDlg .provinceChoose').html(html);
    $('#moveSoildiersDlg .maPid').val(pid);
    $('#moveSoildiersDlg').dialog('open');
}

function showProvince(id) {
    if(provincesAsoc[id].owner.id == userId) {
        $('#provinceView .loaded').css('display', 'none');
        $('#provinceView .loading').css('display', 'block');
        $('.showSoildierMoveDlg').attr('pid', id);
        $('.insPID').attr('pid', id);
        
        updateProvince(id);

        $('#provinceView').dialog('open');
    } else if(provincesAsoc[id].owner.id == null) {
        showFreeProvinceDialog(id);
    } else {
        showEnemyProvinceDialog(id);
    }
}

function showEnemyProvinceDialog(id) {
    $.get('json/getarmyinfo', function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            return;
        }
        var p = provincesAsoc[id];
        $('#enemyDialog .battle input.battleBtn').attr('pid', id);
        $('#enemyDialog .provinceName').html(p.name);
        $('#enemyDialog .playerName').html(p.owner.id ? p.owner.nickname : '<span style="color:red;">Free province</span>');
        var d = r.content;
        var html = '';
        $.each(d, function(i, item) {
            html += '<tr><td>'+provincesAsoc[item.provinceId].name+'</td><td>';
            html += '<div class="sliderInfo">';
            html += '<input type="hidden" class="province_id" name="province_id" value="'+item.provinceId+'"/>';
            html += '<div class="max">'+item.maxArmy+'</div><input class="current slider_'+i+'_value" type="text" name="slider_'+i+'_value" value="0"/><div class="min">0</div><br class="clear"/></div>';
            html += '<div class="slider_'+i+'"></div>';
            html += '</td></tr>';
        });
        $('#enemyDialog .battle table tbody').html(html);
        $.each(d, function(i, item) {
            $('#enemyDialog .slider_'+i).slider({
                range: 'min',
                value: 0,
                min: 0,
                max: item.maxArmy,
                slide: function(event, ui) {
                    $('#enemyDialog input[name=slider_'+i+'_value]').val(ui.value);
                }
            });
        });
        $('#enemyDialog').dialog('open');
    });
}
function showFreeProvinceDialog(id) {
    showEnemyProvinceDialog(id);
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
            $('.showSoildierMoveDlg').attr('soldiers', resources.soldiers);
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
                        params: [p.id, b.slot_index, b, p.resources],
                        click: function (e, params) {
                            showBuildingUpgrader(params[0], params[2], params[3]);
                        //                            upgradeBuilding(params[0], params[1]);
                        }
                    }
                    balls[balls.length] = {
                        css: 'bgtoggle info',
                        title: 'More',
                        params: [p.id, b],
                        click: function (e, params) {
                            showBuilding(params[0], params[1]);
                        }
                    }
                    balls[balls.length] = {
                        css: 'bgtoggle destroy',
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
                var click = null;
                var params = null;
                if(slots[i] == null) {  // domyślne budynki
                    click = function(event, param) {
                        showBuildingChooser(id, param);
                    }
                    params = {
                        resources: p.resources,
                        slotIndex: i
                    };
                //                    for (var bname in buildings) {
                //                        // sprawdzać ilość resourców
                //                        balls[balls.length] = {
                //                            css: 'bgtoggle develop',
                //                            title: 'Build '+bname,
                //                            params: [p.id, i, bname],
                //                            click: function (e, params) {
                //                                createBuilding(params[0], params[1], params[2]);
                //                            }
                //                        }
                //                    }
                } else {
                    balls = slots[i].balls;
                    img = slots[i].img;
                }
                buildBallMenu($('#slot'+i), {
                    img: img,
                    css: 'test',
                    click: click,
                    params: params,
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


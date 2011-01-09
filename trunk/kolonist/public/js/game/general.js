var ajaxProxy = 'proxy.php?url=';
ajaxProxy = '';
var slotMax = 5;
var userId = 4;
var userName = '';
var maxProgress = 4;
var currentProgress = 0;
var progressFinisfed = new Array();

function setCurrentProgress(name) {
    progressFinisfed[name] = true;
    if(currentProgress == maxProgress) {
        return;
    }
    currentProgress++;
    $('#loadingDialog .progresDetails tr.'+name+' img').attr('src', 'graph/tick.png');
    $('#loadingDialog div.progressbar').progressbar('option', 'value', parseInt(100*currentProgress/maxProgress));
    if(currentProgress == maxProgress) {
        setTimeout("$('#loadingDialog').dialog('close')", 2000);
    }
}
function isProgressFinished(name) {
    return progressFinisfed[name] == true;
}

$(function() {

    $('#loadingDialog div.progressbar').progressbar({
        value:currentProgress
    });
    $('#loadingDialog').dialog({
        //        autoOpen: false,
        modal: true,
        resizable: false,
        hide: 'fold',
        title: 'Loading game',
        open: function(event, ui) {
            $('#loadingDialog').parents('div').children('div.ui-dialog-titlebar').remove();
        }
    });

    $.get('json/currentuser', function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            document.location = '/';
            return;
        }
        userId = r.content.id;
        userName = r.content.username;
        initMap();
        setCurrentProgress('player');
        setCurrentMapPosition();
    });
});

function setCurrentMapPosition() {
    if(isProgressFinished('provinces') && isProgressFinished('world')) {
        var pid = 0;
        for(var i in provinces) {
            if(provinces[i].owner.id == userId) {
                pid = provinces[i].id;
                break;
            }
        }
        centerProvince(pid);
    } else {
        setTimeout('setCurrentMapPosition()', 250);
    }
}

function processError(code, message) {
    $('#errorDialog').html(message);
    $('#errorDialog').dialog({
        title: 'Error',
        modal: true,
        buttons: {
            "OK": function() {
                $('#errorDialog').dialog('close');
            }
        }
    });
}
function processInfo(code, message) {
    $('#infoDialog').html(message);
    $('#infoDialog').dialog({
        title: 'Info',
        modal: true,
        buttons: {
            "OK": function() {
                $('#infoDialog').dialog('close');
            }
        }
    });
}

function parseJSON(data) {
    var r= null;
    try {
        r = jQuery.parseJSON(data);
    } catch (ex) {
        processError('DATA_ERROR', 'JSON conversion error.');
        return undefined;
    }
    if(r.status === undefined) {
        alert(data);
        processError('DATA_ERROR', 'Kolonist data format invalid.');
        return undefined;
    }
    if(isError(r)) {
        return undefined;
    }
    return r;
}

function isError(data) {
    if(data.status.code != 'OK') {
        processError(data.status.code, data.status.message);
        return true;
    }
    return false;
}

function isArray(obj) {
   if (obj.constructor.toString().indexOf("Array") == -1)
      return false;
   else
      return true;
}

function dump(v) {
    var r = 'Dump:\n';
    for (var a in v) {
        r += a +'='+v[a]+';\n';
    }
    alert(r);
}

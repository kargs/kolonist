var ajaxProxy = 'proxy.php?url=';
var slotMax = 5;
var userId = 4;
var userName = '';

$(function() {
    $.get('json/currentuser', function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            document.location = '/';
            return;
        }
        userId = r.content.id;
        userName = r.content.username;
        initMap();
    });
});

function processError(code, message) {
    $('#errorDialog').html(message);
    $('#errorDialog').dialog({
        title: 'Error',
        model: true,
        buttons: {
            "OK": function() {
                $('#errorDialog').dialog('close');
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


function dump(v) {
    var r = 'Dump:\n';
    for (var a in v) {
        r += a +'='+v[a]+';\n';
    }
    alert(r);
}

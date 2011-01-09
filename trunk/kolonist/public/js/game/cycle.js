$(function() {
    cycle();

    function cycle() {
        processGameState();
//    //        setTimeout(cycle, 30000);
    }

    $('.showMsgBtn').live('click', function(event) {
        event.preventDefault();
        $.get('json/messages', function(data) {
            var r = null;
            if((r = parseJSON(data)) === undefined) {
                return;
            }
            var html = '';
            if(r.content.infos === undefined || r.content.infos.length == 0) {
                html = translate('noMessages');
            } else {
                html = renderMessage(r.content.infos);
            }
            html = $('div#messageDlg').html(html);
            $('div#messageDlg').dialog('open');
        });
    });

    $('div#messageDlg').dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        title: translate('msgDlgTitle'),
        width: 430
    });
});

function processGameState() {
    $.get(ajaxProxy+'json/cycle', {}, function(data) {
        var r = null;
        if((r = parseJSON(data)) === undefined) {
            return;
        }
        var html = '<ul>';
        $.each(r.content.provinces, function(i, item) {
            provincesAsoc[item.id].owner = item.owner;
            provincesAsoc[item.id].name = item.name;
            if(item.owner.id == userId) {
                html += '<li rel="'+item.id+'">'+provincesAsoc[item.id].name+'</li>';
            }
        });
        html += '</ul>';
        $('div#myProvincesDialog div.myProvincesList').html(html);
        initMap();
        setCurrentProgress('world');
        // komunikaty

        if(!(r.content.infos === undefined) && r.content.infos.length > 0) {
            html = renderMessage(r.content.infos);
            $('div#messageDlg').html(html);
            $('div#messageDlg').dialog('open');
        }
    });
}
function renderMessage(msgs) {
    var html = '<table><thead><tr><td>'+translate('msgType')+'</td><td>'+translate('msgContent')+'</td><td>'+translate('msgDate')+'</td></tr></thead><tbody>';
    $.each(msgs, function(i, item) {
        var date = item.date;
        var msg = item.message;
        var tend = msg.indexOf(']');
        var type = msg.substr(1, tend-1);
        msg = msg.substr(tend+1, msg.length);

		var img = 'graph/buildings/settlers.png';
		switch(type) {
			case 'fight-win':
				img = 'graph/win.png';
				break;
			case 'fight-loose':
				img = 'graph/lost.png';
				break;
			case 'storage':
				img = 'graph/buildings/storehouse.png';
				break;
			case 'resources':
				img = 'graph/buildings/wood.png';
				break;
		}

        html += '<tr class="msg_'+type+'"><td class="type"><img src="' + img + '" alt="" width="64" />'+translate(type)+'</td>';
        html += '<td class="content">'+msg+'</td><td class="date">'+date+'</td>';
    });
    html += '</tbody></html>';
    return html;
}
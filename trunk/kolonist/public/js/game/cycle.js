$(function() {
    cycle();

    function cycle() {
        processGameState();
//        setTimeout(cycle, 30000);
    }

    $('.showMsgBtn').live('click', function(event) {
        event.preventDefault();
        $('div#messageDlg').dialog('open');
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

        if(r.content.infos.length > 0) {
            var html = '<table><thead><tr><td>'+translate('msgType')+'</td><td>'+translate('msgContent')+'</td><td>'+translate('msgDate')+'</td></tr></thead><tbody>';
            $.each(r.content.infos, function(i, item) {
                var date = item.date;
                var msg = item.message;
                var tend = msg.indexOf(']');
                var type = msg.substr(1, tend-1);
                msg = msg.substr(tend+1, msg.length);
                html += '<tr class="msg_'+type+'"><td class="type"><img src="" alt=""/>'+translate(type)+'</td>';
                html += '<td class="content">'+msg+'</td><td class="date">'+date+'</td>';
            });
            html += '</tbody></html>';
            $('div#messageDlg').html(html);
            $('div#messageDlg').dialog('open');
        }
    });
}
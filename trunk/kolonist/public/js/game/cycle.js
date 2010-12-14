$(function() {
    cycle();

    function cycle() {
        processGameState();
        setTimeout(cycle, 30000);
    }

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
    });
}
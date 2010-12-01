$(function(){
    $('.register_btn').click(function(event) {
        event.preventDefault();
        $('.register_form').dialog('open');
    });
    $('.register_form').dialog({
        autoOpen: false,
        modal: true
    });
});
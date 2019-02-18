momentFormat = { full: 'YYYY/MM/DD HH:mm', date: 'YYYY/MM/DD', time: 'HH:mm' };

$(document).ready(function() {
    $(".guayaquil_table").attr('border', '0');

    $(".show-control-submenu").click(function(e) {

        var submenu = $(e.currentTarget.parentNode).find(".control-submenu");
        var vis = submenu.is(":visible");

        $(".control-submenu").hide();

        if (!vis) {
            submenu.show();
        }

        e.stopPropagation();
    });

    $("#show-land").click(function(e) {
        $(".lang-box").toggle();

        e.stopPropagation();
    });

    $("#show_subcustomers").click(function(e) {
        $(".subcustomers-box").toggle();

        e.stopPropagation();
    });

    $("#show-logon").click(function(e) {
        $(".logon-box").toggle();

        e.stopPropagation();
    });

    $(".lang-box").click(function(e) {
        e.stopPropagation();
    });

    $(".subcustomers-box").click(function(e) {
        e.stopPropagation();
    });

    $(".logon-box").click(function(e) {
        e.stopPropagation();
    });

    $('input.TxtBoxInt').keyup(function() {
        if (this.value.match(/[^0-9]/g)) {
            this.value = this.value.replace(/[^0-9]/g, '');
        }
    });

    $('html').click(function() {
        $(".control-submenu").hide();
        $(".lang-box").hide();
        $(".subcustomers-box").hide();
        $(".logon-box").hide();
    });

    $('#dropdownSearch').on('shown.bs.dropdown', function () {
        $('#txtHeaderDetailNum').focus();
        $("#txtHeaderDetailNum:text:visible:first").focus();
        $('#txtHeaderDetailNum').val("");
    });
});

function ChangeInputText(id, text) {
    $("#" + id).val(text);
}
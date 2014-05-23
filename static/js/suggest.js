$(document).ready(function() {

    var form  = $(".search");
    var query = $('.search input[name="query"]');
    var autocomplete_holder = $('#autocomplete');
    var suggestions_holder = $('#suggestions');

    function add_autocompletion(entry) {
        autocomplete_holder.append("<li id='" + entry.cui + "'>" + entry.str );
    }

    function add_suggestion(entry) {
        suggestions_holder.append("<div id='" + entry.cui + "'>" + entry.str + "</div>");
    }

    // Place the current "active" autocomplete string in the search bar
    function autocomplete_tab() {
        var current = autocomplete_select_active();

        query.val(current.text());
    }

    function autocomplete_up() {
        var current = autocomplete_select_active()
                .removeClass('active');

        if (current[0] == autocomplete_holder.children().first()[0]) {
            autocomplete_holder
                .children()
                .last()
                .addClass('active');
        }
        else {
            current
                .prev()
                .addClass('active');
        }
    }

    function autocomplete_down() {
        var current = autocomplete_select_active()
                .removeClass('active');

        if (current[0] == autocomplete_holder.children().last()[0]) {
            autocomplete_holder
                .children()
                .first()
                .addClass('active');
        }
        else {
            current
                .next()
                .addClass('active');
        }
    }

    function autocomplete_select_active() {
        var elem = autocomplete_holder.find('.active');

        return elem.length ?
            elem :
            autocomplete_holder
                .children()
                .first()
                .addClass('active');
    }

    function autocomplete_hotkeys(event) {

        // On `tab`
        if (event.keyCode === 9) {
            autocomplete_tab();
            event.preventDefault();
        }

        // Up
        if (event.keyCode === 38) {
            autocomplete_up();
            event.preventDefault();
        }

        // Down
        if (event.keyCode === 40) {
            autocomplete_down();
            event.preventDefault();
        }
    }

    function autocomplete(event) {

        // Ignore non usefull keys
        // Allow backspace
        if (event.keyCode !== 8 && (event.keyCode < 48 || event.keyCode > 91))
            return false;

        var value = query.val();

        if (value.length < 2) {
            autocomplete_holder.slideUp(80).empty();
            return false;
        }

        $.post("/autocomplete", { query: value }, function(data) {
            // Clear results
            autocomplete_holder.empty();

            if (data.length > 0) {
                autocomplete_holder.slideDown(80);
                data.map(add_autocompletion);
            }
            else {
                autocomplete_holder.slideUp(80);
            }


            autocomplete_select_active();
        });
    }

    // TODO throttle to rate limit
    // TODO only send new request if input changed
    query.on("keyup", autocomplete);
    query.on("keydown", autocomplete_hotkeys);

    form.submit(function() {
        suggest();
        return false;
    });
});
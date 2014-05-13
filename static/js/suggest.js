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

    function autocomplete(event) {

        // Ignore non usefull keys
        // Allow backspace
        if (event.keyCode != 8 && (event.keyCode < 48 || event.keyCode > 91))
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
        });
    }

    function suggest() {
        var value = query.val();

        $.post("/suggest", { query: value }, function(data) {
            // Clear results
            suggestions_holder.empty();

            if (data.length > 0) {
                data.map(add_suggestion);
            }
        });
    }

    // TODO throttle to rate limit
    // TODO only send new request if input changed
    query.on("keyup", autocomplete);

    form.submit(function() {
        suggest();
        return false;
    });
});
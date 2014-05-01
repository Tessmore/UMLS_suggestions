$(document).ready(function() {

    var form  = $(".search");
    var query = $('.search input[name="query"]');
    var results = $('#suggestions');

    function add_suggestion(entry) {
        results.append("<li>" + entry.str + entry.cui );
    }

    function get_suggestions(event) {

        // Ignore non usefull keys
        // Allow backspace
        if (event.keyCode != 8 && (event.keyCode < 48 || event.keyCode > 91))
            return false;

        var value = query.val();

        if (value.length < 2) {
            results.slideUp(80).empty();
            return false;
        }

        $.post("/autocomplete", { query: value }, function(data) {
            // Clear results
            results.empty();

            if (data.length > 0) {
                results.slideDown(80);
                data.map(add_suggestion);
            }
            else {
                results.slideUp(80);
            }
        });
    }

    // TODO throttle to rate limit
    // TODO only send new request if input changed
    query.on("keyup", get_suggestions);

    form.submit(function() {
        // get_suggestions();
        return false;
    });
});
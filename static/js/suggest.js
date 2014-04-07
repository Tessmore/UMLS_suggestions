$(document).ready(function() {

    var form  = $(".search");
    var query = $('.search input[name="query"]');
    var results = $('.results');

    function get_suggestions() {
        $.post("/search", { query: query.val() }, function(data) {

            results.empty();

            for (i in data) {
                results.append("<li>"+ data[i].text );
            }
        });
    }

    // TODO throttle to rate limit
    query.on("keyup", get_suggestions);

    form.submit(function() {
        get_suggestions();
        return false;
    });

});
var config = require('../json/config.json');
var _      = require('underscore');

// JSON request client, for extending the elasticsearch client.
var elastic_raw_client = require('request-json').newClient(config.elastic_db.host + "/" + config.elastic_db.name);

exports.autocomplete = function autocomplete(req, res) {
    var results = [];
    var query   = req.body.query;

    var lookup = {
        "result" : {
            "text" : query,
            "completion" : {
                "size"  : 100,
                "field" : "title",
                "fuzzy" : {
                    "min_length"    : 3,
                    "prefix_length" : 5
                }
            }
        }
    };

    elastic_raw_client.post('_suggest/', lookup, function(err, raw_res, body) {
        if (err) {
            console.log(err);
        }

        if (body && body.result && body.result[0].options && body.result[0].options.length > 0) {
            results = _.map(body.result[0].options, convert_output);
            results = _.uniq(results, false, function(item) { return item.cui; });
        }

        res.json(results);
    });
};


function convert_output(result) {
    result = result.text.split(' | ');

    return { 'str' : result[0], 'cui' : result[1] };
}
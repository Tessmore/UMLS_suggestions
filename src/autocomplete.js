var config = require('../json/config.json');
var _      = require('underscore');
var rjson  = require('request-json');

var client = rjson.newClient(config.elastic_db.host + "/");

exports.autocomplete = function autocomplete(req, res) {
    var results = [];
    var query   = req.body.query;

    var type = config.elastic_db.diagnose_table;

    // Set the correct type
    if (req.body.type === "medicine")
        type = config.elastic_db.medicine_table;

    // You cannot filter a completion search in Elasticsearch
    var lookup = {
        "result" : {
            "text" : query,
            "completion" : {
                "size"  : 150,
                "field" : "title",
                "fuzzy" : {
                    "min_length"    : 3,
                    "prefix_length" : 5
                }
            }
        }
    };

    client.post(type + "/_suggest", lookup, function(err, raw_res, body) {
        if (err && err.code === "ECONNREFUSED") {
            console.log("Please start Elasticsearch database");
            process.exit(1);
        }

        if (body && body.result && body.result[0].options && body.result[0].options.length > 0) {
            results = body.result[0].options;
            results = _.map(results, convert_output);

            results = results.sort(function(a, b){ return a.str.length - b.str.length; });
            //results = _.uniq(results, true, function(item) { return item.cui; });
            results = _.uniq(results, true, function(item) { return item.str; });
        }

        res.json(results);
    });
};

function convert_output(result) {
    result = result.text.split(' | ');

    return { 'str' : result[0], 'cui' : result[1] };
}
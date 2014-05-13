var config = require('../json/config.json');
var _      = require('underscore');

// JSON request client, for extending the elasticsearch client.
var elastic_raw_client = require('request-json').newClient(config.elastic_db.host + "/" + config.elastic_db.name);

exports.suggest = function suggest(req, res) {
    var results = [];
    var query   = req.body.query;

    var lookup = {
        "query" : {
            "multi_match" : {
                "query"  : query,
                "fields" : [ "title^2", "keywords" ]
            }
        }
    };

    elastic_raw_client.post('_search/', lookup, function(err, raw_res, body) {
        if (err) {
            console.log(err);
        }

        if (body && body.hits.hits.length > 0) {
            results = body.hits.hits;
            results = _.map(results, convert_output);
            results = _.uniq(results, false, function(item) { return item.cui; });
        }

        res.json(results);
    });
};


function convert_output(result) {
    var str = result._source.title.input;
    var cui = result._source.cui;

    return { 'str' : str, 'cui' : cui };
}
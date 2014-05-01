var config   = require('../json/config.json');
var settings = require('../json/settings.json');

var async   = require('async');
var ld      = require('ld');
var utf8    = require('utf8');
var _       = require('underscore');
var asciifolding = require('diacritics').remove;

// Official elasticsearch client
var elastic = new require('elasticsearch').Client({
  host: config.elastic_db.host
});

// JSON request client, for extending the elasticsearch client.
var elastic_raw_client = require('request-json').newClient(config.elastic_db.host + "/" + config.elastic_db.name);

// MySQL client
var umls = require('mysql').createConnection(config.umls_db);


exports.install = function install(req, res) {

    // TODO : return false if in production + ready

    var inc   = config.umls_include.join("','");
    var query = "SELECT DISTINCT cui, sty FROM mrsty WHERE sty IN ('" + inc + "')";

    // Sends json request to create initial mapping and settings
    elastic_raw_client.post('', settings, function(err, raw_res, body) {
        console.log("Starting");

        if (err)
            console.log(err);

        // If database and mappings are created
        umls.query(query, function(err, type) {
            if (err)
                throw err;

            console.log("Found: " + type.length + " UMLS records.");

            async.each(type, insert_diagnoses, function(err) {
                if (err)
                    console.log(err);
            });
        });

        res.json("Done");
    });
};

/** Helper functions *************/

function insert_diagnoses(mrsty) {

    var cui   = mrsty.cui;
    var type  = mrsty.sty;
    var query = "SELECT str,lat FROM `mrconso` WHERE cui='" + cui + "' AND ISPREF='Y' AND STT='PF' AND SUPPRESS='N' AND CHAR_LENGTH(str) < 30";

    var args =  {
        index : config.elastic_db.name,
        type  : config.elastic_db.table,
        body  : {
            cui   : cui,
            type  : type,
            title : {},
            keywords : [],
            lang  : "ENG"
        }
    };

    umls.query(query, function(err, records) {
        if (err) throw err;

        records = filter_conso_records(records);

        while (records.length > 0) {
            // global for groupBy
            current = records.shift();

            var input = current.str;

            // Check the word distance for each word
            var test = _.groupBy(records, group_conso);

            if (test['true']) {
                input = [input].concat(_.pluck(test['true'], 'str'));
            }

            if (test['false'] && test['false'].length > 0) {
                records = test['false'];
            }

            args.body.title = {
                input  : input,
                output : [current.str, cui].join(' | ')
            };

            args.body.lang = current.lat;
            args.body.keywords = current.str.split(' ');

            elastic.create(args, function(err, es_res) {
                if (err)
                    console.log(err);
            });
        }
    });
}

// Select filtered, normalized and unique entries
function filter_conso_records(records) {
    records = records
                .filter(filter_conso)
                .map(normalize_conso);

    return _.uniq(records, false, pluck_conso);
}


function length_difference(a, b) {
    return Math.abs(a.length - b.length);
}

function compare_prefix(a, b) {
    return a.substring(0, 3) === b.substring(0, 3);
}

function group_conso(input) {
    var same_prefix = compare_prefix(current.str, input.str);
    var length_diff = length_difference(current.str, input.str);

    if (same_prefix && length_diff < 4)
        return ld.computeDistance(current.str, input.str) < 5;

    return false;
}

// Iterator checker (compare on the 'str' attribute)
function pluck_conso(input) {
    return input.str;
}

function filter_length(input) {
    return input.length > 3
}

function keyword_reduce(list, item) {
    return list.concat(item.split(' '));
}

// Removes entries that have [Disease/finding] etc.
function filter_conso(input) {
    return input.str.length > 5       && // Entries should be long enough
            !/\d/.test(input.str)     && // Have no numbers
           input.str.indexOf('(') < 0 && // Not contain ( ) or []
           input.str.indexOf('[') < 0;
}

// Input: Object with a 'str' and a lat (language)
function normalize_conso(input) {
    var str = input.str;

    // Database gives us utf8, but it is encoded
    try {
        str = utf8.decode(str);
        str = asciifolding(str);
    }
    catch (err) {
        console.log("utf8 decoding failed for: " + input.str)
    }

    str = str.toLowerCase()
             .replace(/'/g, "")
             .replace(/\W+/g, " ")
             .replace(/\s+/g, " ")
             .trim();

    return {
        str: str,
        lat: input.lat
    }
}
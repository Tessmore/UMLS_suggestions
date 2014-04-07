var express = require('express');
var engine = require('ejs-locals')

var request    = require('request-json');
var raw_client = request.newClient('http://localhost:9200/umls/');


var port   = 9000;
var app    = express();

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

app.configure(function() {
  app.use(express.bodyParser());

  // SESSION storage
  app.use(express.cookieParser('UMLS search prototype'));
  app.use(express.cookieSession());

  app.use(express.static(__dirname + '/static'));

  app.engine('ejs', engine);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
});

/**
    GET
*/

// Search form
app.get(['/', '/search'], function(req, res) {
    res.render('index');
});

// Insert new document
app.get(['/insert', '/new', '/create'], function(req, res) {
    res.render('create');
});


/**
    POST
*/

// Return search results
app.post('/search', function(req, res) {

    var data = {
        "result" : {
            "text" : req.body.query,
            "completion" : {
                "field" : "alt_suggest",
                "fuzzy" : {
                    "edit_distance" : 1
                }
            }
        }
    };

    raw_client.post('_suggest/', data, function(err, raw_res, body) {
        if (body && body.result && body.result[0].options && body.result[0].options.length > 0)
            res.json(body.result[0].options);

        res.json([]);
    });
});

app.post('/insert', function(req, res) {
    var alternatives = (req.body.title + " | " + req.body.alternatives).split(" | ");

    var args = {
        index : 'umls',
        type  : 'diagnose',
        body  : {
            cui     : req.body.cui,
            title   : req.body.title,
            suggest : alternatives,
            alt_suggest : {
                input: alternatives
            }
        }
    };

    client.create(args, function(err, es_res) {
        if (err)
            console.log(err);

        res.json(es_res);
    });
});

// Run this once to create the mapping
app.get('/install', function(req, res) {

    client.index({
      index: 'umls',
      type: 'diagnose',
    },
    function (err, es_res) {
        client.indices.putMapping({
            index: 'umls',
            type: 'diagnose',
            body: {
                properties: {
                    title        : { type: "string" },
                    cui          : { type: "string" },
                    alternatives : { type: "string" },
                    alt_suggest  : {
                        type            : "completion",
                        index_analyzer  : "simple",
                        search_analyzer : "simple",
                        payloads        : false
                    }
                }
            }
        },
        function (err, es_res) {
            res.json(es_res);
        });
    });
});

app.listen(port);
console.log("Server running at port: " + port)
var config  = require('./json/config.json');
var express = require('express');
var app     = express();


// Express app configuration
app.configure(function() {
  app.use(express.bodyParser());

  // SESSION storage
  app.use(express.cookieParser('UMLS search prototype'));
  app.use(express.cookieSession());

  app.use(express.static(__dirname + '/static'));

  app.engine('ejs', require('ejs-locals'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
});


// Search form
app.get(['/', '/search'], function(req, res) {
    res.render('index');
});

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

// Run this once to create the mapping
app.get('/install', require('./src/install').install);

// Return "suggestion" results
app.post('/autocomplete', require('./src/autocomplete').autocomplete);
app.post('/suggest',      require('./src/suggest').suggest);


app.listen(config.port);
console.log("Server running at port: " + config.port)
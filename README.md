UMLS suggestions
=========

A compact search engine to suggest (preferred) UMLS terms.

## Usage

If you have elasticsearch, node and npm installed you can use `npm start` (assuming elasticsearch runs on localhost:9200). There is now an app on `localhost:9000`. Since it is only a prototype there are no security settings. To setup your "database" goto: `localhost:9000/install`. This will create an empty index for new records.

After installing you can insert UMLS records. Enter the CUI + preferred title and alternatives. The alternatives can contain multiple entries seperated by ` | `.


### API

| Request       | Method      | Response summary  |
| ------------- |-------------| -----|
| /insert      | GET | Form to insert an UMLS entry (CUI, Title and alternatives) |
| /insert      | POST      |   Saves the UMLS entry and adds the alternatives as suggestions (i.e you create a mapping of alternatives to single CUI : TITLE format) |
| / | GET      |  Search form |
| /search | GET      |  Search form |
| /search | POST      |  Search for suggestions based on given `query` parameter. Returns a list of possible outcomes  |
| /install | GET      |  Create the index and mapping for elasticsearch  |

## Dependencies

This is a small nodeJS and elasticsearch project. Make sure you `npm install` to get the correct modules:

* elasticsearch
* ejs
* express
* request-json

## Info

Elasticsearch database tutorial / getting started:

http://red-badger.com/blog/2013/11/08/getting-started-with-elasticsearch/
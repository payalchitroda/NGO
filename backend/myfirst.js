var express = require('express');
const bodyParser = require("body-parser");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var dbo;
MongoClient.connect(url, function (err, mongo) {
  if (err) throw err;
  dbo = mongo.db("ngo");
  
});
var cors = require('cors');


var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(bodyParser.json());
app.get('/', (function (req, res) {
  res.send('welcome');

}));

app.use(cors());
app.get('/awards', (function (req, res) {
  dbo.collection("awards").find({},{ projection: { _id: 0, item: 1,image: 1 } }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
  
}));




var server = app.listen(8080, function () { });







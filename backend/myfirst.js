var express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
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

app.use(session({ secret: 'nottosay', saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.get('/', (function (req, res) {
  res.send('welcome');

}));

app.use(cors());
app.get('/awards', (function (req, res) {
  dbo.collection("awards").find({}, { projection: { _id: 0, item: 1, image: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });

}));

var sess;
app.post('/login', (function (req, res) {
  sess = req.session;
  sess.username = req.body.username;
  sess.password = req.body.password;
  dbo.collection("donor").find({ Username: req.body.username, Password: req.body.password}).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
     res.send('incorrect username or password');
    }
    else {
      res.end('done');
      
    }

  });

}));

app.post('/register', (function (req, res) {

  dbo.collection("donor").find({ Username: req.body.Username }).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {

      dbo.collection("donor").insertOne({ Name: req.body.Name, Address: req.body.Address, Mobileno: req.body.Mobileno, Emailid: req.body.Emailid, Username: req.body.Username, Password: req.body.Password }, function (err, res) {
        if (err) throw err;
      });
      console.log("inserted");
      res.send("http://localhost:5000/login");

    }
    else {
      res.send("http://localhost:5000/register");
      console.log("not inserted");
    }

  });

}));


app.get('/donate/:amountdonated', (req, res) => {
  var amount = req.params.amountdonated;
 // sess = req.session;
  sess.username;

  console.log(sess.username);
  console.log(amount);
  res.end();


});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/login');
  });

});



var server = app.listen(8080, function () { });







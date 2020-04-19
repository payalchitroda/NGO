// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').load();
// }
//require('dotenv').config({path:'backend\.env'});

var express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var dbo;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = require('stripe')(stripeSecretKey)


console.log(stripeSecretKey, stripePublicKey);

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
  dbo.collection("donor").find({ Username: req.body.username, Password: req.body.password }).toArray(function (err, result) {
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
/*
app.post('/stripedonate', (req, res) => {
  var amount = req.params.amountdonated;
  // sess = req.session;
  (async () => {
    const session = await stripe.checkout.sessions.create({
      customer: 'abc',
      payment_method_types: ['card'],
      line_items: [{
        amount: '120',
        currency: 'inr',
      }],
  
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    })
      .catch(function () {
        console.log("error");
      });
  
  })();
  sess.username;
  res.end();


});*/


app.get('/donate/:amountdonated', (req, res) => {
  var data = req.params.amountdonated;
  var Donor = dbo.collection("donor");
  Donor.update({ Username: sess.username }, { $addToSet: { accounthistory: { amount: data } } }, function (err, doc) {
    if (err) {
      console.log("Something wrong when updating data!");
    }

    console.log("inserted");
  });
  res.redirect("http://localhost:5000/dashboard");
  res.end();


});



app.post('/pay', (req, res) => {
  var token = req.body.stripeToken;
  var amoun = req.body.payamount;
  var pay = stripe.payment.create({
    donationamount: amount,
    currency: "gbp",
    source: token
  }, function (err, pay) {
    if (err & err.type === "StripeCardError")
      console.log("your card was declined");
  });
  console.log("your payment was successfull");


});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/login');
  });

});


app.get('/articles', (req, res) => {
  dbo.collection("articles").find({}, { projection: { _id: 0, title: 1, author: 1, date: 1, category: 1, image: 1, content: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });

});


app.get('/recentarticles', (req, res) => {


  dbo.collection("articles").find({}, { "sort": ['date', 'desc'] }).limit(3).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });

});



app.post('/article', (req, res) => {

  dbo.collection("articles").find({ title: req.body.title }, { projection: { title: 1, author: 1, date: 1, category: 1, image: 1, content: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    console.log("result is" + result);
    res.send(result);
  });

});


app.post('/comment', (req, res) => {
  var Article = dbo.collection("articles");
  Article.update({ title: req.body.article }, { $addToSet: { comments: { Email: req.body.email, comment: req.body.comment, date: Date() } } }, function (err, doc) {
    if (err) {
      console.log("Something wrong when updating data!");
    }

  });

  res.end();

});

app.post('/comments', (req, res) => {
  dbo.collection("articles").find({ title: req.body.article }, { projection: { comments: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });

});



app.post('/forumcomment', (req, res) => {

  function getNextSequenceValue(sequenceName) {
    var sequenceDocument = dbo.collection("counters").findAndModify({
      query: { _id: sequenceName },
      update: { $inc: { sequence_value: 1 } },
      new: true
    });
    console.log("data!" + sequenceDocument.sequence_value);
    return sequenceDocument.sequence_value;
  }
  var f = dbo.collection("forum");
  f.update({ Name: req.body.forum }, { $addToSet: { comments: { "_id": getNextSequenceValue("commentid"), Email: req.body.email, comment: req.body.comment, date: Date() } } }, function (err, doc) {
    if (err) {
      console.log("Something wrong when updating data!");
    }

  });

  res.end();

});

app.post('/forumcomments', (req, res) => {
  dbo.collection("forum").find({ Name: req.body.forum }, { projection: { comments: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });

});

var c = 0;
app.post('/support', (req, res) => {

  dbo.collection("onlineevents").find({ "supporters": req.body.email }).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
      c = c + 1;
      var onlineevents = dbo.collection("onlineevents");
      onlineevents.update({ Name: "fight for deforestation" }, { $addToSet: { supporters: req.body.email } }, function (err, result) {
        if (err) throw err;
      });
      res.send("done");

    }
    else {

      console.log("not inserted");
    }

  });

});







var server = app.listen(8080, function () { });







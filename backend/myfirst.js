// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').load();
// }
//require('dotenv').config({path:'backend\.env'});

var express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var flash = require("connect-flash");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
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
app.use(flash());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({ secret: 'nottosay', saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.get('/', (function (req, res) {
  res.send('welcome');

}));

app.use(cors());
app.get('/awards', (function (req, res) {
  dbo.collection("awards").find({}, { projection: { _id: 0, item: 1, image: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    //console.log(result);
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
        console.log("register"+result);
      });
     // console.log("inserted");
      res.send("http://localhost:5000/login");

    }
    else {
      res.send("http://localhost:5000/register");
     // console.log("not inserted");
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
      //console.log("Something wrong when updating data!");
    }

   // console.log("inserted");
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
  //console.log("your payment was successfull");


});

app.get('/logout', (req, res) => {
  sess=undefined;
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('http://localhost:5000/login');
  });

});


app.get('/articles', (req, res) => {
  dbo.collection("articles").find({}, { projection: { _id: 0, title: 1, author: 1, date: 1, category: 1, image: 1, content: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    //console.log(result);
    res.send(result);
  });

});


app.get('/recentarticles', (req, res) => {


  dbo.collection("articles").find({}, { "sort": ['date', 'desc'] }).limit(3).toArray(function (err, result) {
    if (err) throw err;
   // console.log(result);
    res.send(result);
  });

});



app.get('/article/:title', (req, res) => {

  dbo.collection("articles").find({ title: req.params.title }, { projection: { title: 1, author: 1, date: 1, category: 1, image: 1, content: 1 } }).toArray(function (err, result) {
    if (err) throw err;
    //console.log("result is" + req.params.title);
    res.send(result);
  });

});


app.post('/comment', (req, res) => {
  var Article = dbo.collection("articles");
  Article.update({ title: req.body.article }, { $addToSet: { comments: { Email: req.body.email, comment: req.body.comment, date: Date() } } }, function (err, doc) {
    if (err) {
     // console.log("Something wrong when updating data!");
    }

  });

  res.end();

});

app.post('/comments', (req, res) => {
  dbo.collection("articles").find({ title: req.body.article }, { projection: { comments: 1 } }).toArray(function (err, result) {
    if (err) throw err;
   // console.log(result);
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
  //  console.log("data!" + sequenceDocument.sequence_value);
    return sequenceDocument.sequence_value;
  }
  var f = dbo.collection("forum");
  f.update({ Name: req.body.forum }, { $addToSet: { comments: { "_id": getNextSequenceValue("commentid"), Email: req.body.email, comment: req.body.comment, date: Date() } } }, function (err, doc) {
    if (err) {
     // console.log("Something wrong when updating data!");
    }

  });

  res.end();

});

app.post('/forumcomments', (req, res) => {
  dbo.collection("forum").find({ Name: req.body.forum }, { projection: { comments: 1 } }).toArray(function (err, result) {
    if (err) throw err;
   // console.log(result);
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

     // console.log("not inserted");
    }

  });

});

app.get('/menu', (req, res) => {
 
  if(typeof sess === 'undefined'){
    
    res.send("false");
  }
  else
  { console.log(sess.username);
    res.send("true");
  }

});

app.post('/abc', (req, res) => {
  console.log("hello");
 
  req.flash('error', 'No account with that email address exists.');
  return res.redirect('http://localhost:5000/temp');
  req.end();
});


app.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      var email = req.body.email;
      dbo.collection("donor").find({ Emailid: req.body.email }).toArray(function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('http://localhost:5000/forgot');
        }
        else {
          var Donor = dbo.collection("donor");
          Donor.update({ Emailid: req.body.email }, { $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 } }, function (err, doc) {
            if (err) {
              // console.log("Something wrong when updating data!");
            }
            done(err, token, email);
          });
        }

      });
    },
    function (token, email, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.GMAIL
        }
      });
      var mailOptions = {
        to: email,
        from: 'evergreenngo123@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('http://localhost:5000/forgot');
  });
});

app.get('/reset/:token', function (req, res) {
  dbo.collection("donor").find({ resetPasswordToken: req.params.token }, { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).toArray(function (err, result) {

    if (err) throw err;
    if (result.length == 0) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('http://localhost:3000/forgot');
    }
    res.redirect('http://localhost:5000/reset?' + req.params.token);
  });

});

app.post('/resett/:token', function (req, res,next) {

  var email;
  dbo.collection("donor").find({ resetPasswordToken: req.params.token }, { projection: { _id: 0, Emailid: 1 } }).toArray(function (err, result) {
    result.forEach(function (a) {
      email=a.Emailid;
    });
    if (err) throw err;
     console.log(email);
   
  });
  
  async.waterfall([
    function (done) {
      dbo.collection("donor").find({ resetPasswordToken: req.params.token }, { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).toArray(function (err, result) {

        if (err) throw err;
        if (result.length == 0) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        res.redirect('http://localhost:5000/reset');
      });

      if (req.body.password === req.body.confirm) {

        var Donor = dbo.collection("donor");
        Donor.update({ resetPasswordToken: req.params.token }, { $set: { Password: req.body.password, resetPasswordToken: undefined, resetPasswordExpires: undefined } }, function (err, doc) {
          if (err) throw err;
          done(err, email);
        });

      } else {
        req.flash("error", "Passwords do not match.");
        return res.redirect('back');
      }

    },
    function (email, done) {
      console.log("hello");
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.GMAIL
        }
      });
      
      var mailOptions = {
        to: email,
        from: 'evergreenngo123@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + email + ' has just been changed.\n'
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail sent');
        req.flash('success', 'Success! Your password has been changed.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('http://localhost:5000/forgot');
  });
});




app.post("/campupcoming", function (req, res)
{
   dbo.collection("campaign").find({"status":"U"},{ projection: { _id: 0,image: 1,c_name:1  } }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
});
app.post("/campfinished", function (req, res)
{
   dbo.collection("campaign").find({"status":"F"},{ projection: { _id: 0,image: 1,c_name:1  } }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
});
app.post("/display_camp.html/:url", function (req, res)
{ 
  var campname=req.params.url;
   dbo.collection("campaign").find({"c_name":campname},{ projection: { _id: 0,description: 1,c_name:1,image:1,loc:1,time:1,status:1} }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
});
app.post("/eventupcoming", function (req, res)
{
   dbo.collection("events").find({"status":"U"},{ projection: { _id: 0,image: 1,e_name:1 } }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
});
app.post("/eventfinished", function (req, res)
{
   dbo.collection("events").find({"status":"F"},{ projection: { _id: 0,image: 1,e_name:1  } }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
});
app.post("/display_event.html/:url", function (req, res)
{  
  var eventname=req.params.url;
   dbo.collection("events").find({"e_name":eventname},{ projection: { _id: 0,description: 1,e_name:1,image:1,loc:1,time:1,status:1} }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
});
app.post("/acceptFeedback/:url", (req, res) => {
   
   console.log(req.body.name);
   console.log(req.body.email);
   console.log(req.body.msg);
   var url=req.params.url;
   console.log("uellrm "+url);
  dbo.collection("feedbacks").insertOne({name: req.body.name,email: req.body.email,msg: req.body.msg},function(err,res){
  if(err)throw err;
  });
  console.log("inserted");
  res.send("http://localhost:5000/"+url);
});
app.post("/campFetch", function (req, res)
{
   dbo.collection("campaign").find({},{ projection: { _id: 0,c_name:1,type:1} }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
   
});
app.post("/eventFetch", function (req, res)
{
   dbo.collection("events").find({},{ projection: { _id: 0,e_name:1,type:1} }).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
   });
   
});
app.post("/articleFetch", function (req, res)
{
   dbo.collection("articles").find({},{ projection: { _id: 0,title:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log("in arrticle "+result);
    res.send(result);
   });
   
});
app.post("/regisFor/:url", (req, res) => {
  console.log(req.body.nameofEorC);
  console.log(req.body.type);
   console.log(req.body.name);
   console.log(req.body.email);
   console.log(req.body.mob);
   console.log(req.body.city);
   var url=req.params.url;
   console.log("uellrm "+url);
  dbo.collection("regisfor").insertOne({nameofEorC: req.body.nameofEorC,type: req.body.type,name: req.body.name,email: req.body.email,mob: req.body.mob,city: req.body.city},function(err,res){
  if(err)throw err;
  });
  console.log("inserted");
  res.send("http://localhost:5000/"+url);
});





var server = app.listen(3000, function () { });







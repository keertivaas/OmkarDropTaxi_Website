var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var unirest = require("unirest"); //Dependency for Fast2SMS API to work
const { response, urlencoded } = require('express');
var app = express();
// app.use(express.static(__dirname + 'assets'))

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var MongoClient = require('mongodb').MongoClient;
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');

//MongoDB Atlas connection string
const url = "mongodb+srv://admin:admin@omkardb.z8ns1.mongodb.net/";

app.get('/', function (req, res, next) {
  res.status(200).sendFile(path.join(__dirname + '/index.html'));
});

app.post('/insert', urlencodedParser, function (req, res) {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var phone = req.body.phone;
  var email = req.body.email;
  var msg = req.body.msg;
  MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
    if (err) throw err;
    var dbo = db.db("OmkarDB");
    var myobj = { First_name: fname, Last_name: lname, Phone: phone, Email: email, Msg: msg };
    dbo.collection("Omkar").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

  var myreq = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

  myreq.query({
    "authorization": "FN4dUYRJkk9ST5U6kicEi2tEnPWTO08hKDfgGZh64SRUsfbZJm3jnSC8Bu1u",
    "sender_id": "TXTIND",
    "message": "Hi!!! " + fname + " left a message for you. Message : "+ msg,
    "route": "v3",
    "numbers": req.body.phone
  });

  myreq.headers({
    "cache-control": "no-cache"
  });


  myreq.end(function (res) {
    if (res.error) throw new Error(res);
  });
  app.locals.output1 = "Thank you for contacting us!";
  app.locals.output2 = "We will get back to you shortly, " + fname;
  res.render('insert');
});


module.exports = app;

app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening at port 3000!");
});
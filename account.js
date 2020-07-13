const express = require('express');
const router = express.Router();                            // used for refactoring code 
const path = require('path');                               // provides path functions
const MongoClient = require('mongodb').MongoClient;         // returns a MongoDB client
const checkAuth = require('./authentication.js').checkAuth; // custom method from authentication.js for authentication

// Login information for MongoDB
const MONGOD_USER = "xxxx";
const MONGOD_PWD = "xxxxx";
var DB_NAME = "test"; // databse name
var uri = "mongodb+srv://"+MONGOD_USER+":"+MONGOD_PWD+
            "@cluster0.jd51y.mongodb.net/"+DB_NAME+"?retryWrites=true&w=majority";

// temporary username and password for testing
var realEmail; 
var realPwd;

// GET REQUESTS, Linking html to pages ====================================================================
// req => sending from client
// res => recieving from server
router.get('/', function(req,res){
    if (!req.session.user_id) res.sendFile(path.join(__dirname+'/static/account/login/login.html'));
    else res.redirect('/dashboard');
});

router.get('/dashboard', checkAuth, function(req,res){
    res.sendFile(path.join(__dirname+'/static/dashboard/dashboard.html'));
});

router.get('/register', function(req,res){
    res.sendFile(path.join(__dirname+'/static/account/register/register.html'));
});

// POST REQUESTS ===========================================================================================
router.post('/login_form', function(req,res){
    var email = req.body.log_email;
    var pwd = req.body.log_pwd;
    if(email === realEmail && pwd === realPwd){
        req.session.user_id = email;              // create a session with the user's username
        req.session.cookie.maxAge = 3600000 * 6; // session expires in 6 hours
        res.redirect('/dashboard');
    }
    else res.redirect('/');
});

router.post('/register_form', function(req,res){
    realEmail = req.body.reg_email;
    realPwd = req.body.reg_pwd;
    res.redirect('/');
});

// testing MongoDB connection
router.post('/connect_form', function(req,res){
    res.redirect('/testing_mongodb');
});

router.get('/testing_mongodb', function(req,res){
    console.log("Welcome to testing platform for MongoDB!");
    // sometimes reads first then inserts, rendering
    var myobj = { name: "Company Inc", address: "Highway 37" };
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
    client.connect(err => {
        if(err) return err;
        console.log("Connected to MongoDB!");
        const collection = client.db(DB_NAME).collection("devices"); // db is databse, collection is table

        // insert one element into the table/collection
        collection.insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("Inserted Company Inc");
        });
        console.log("Attempting to retrieve one entry...");

        // retrieve one element from the table/collection
        collection.findOne({}, function(err, result) {
            if (err) throw err;
            console.log('Entry name retrieved is: ' + result.name);
        });
        
        // count the number of items in the table
        collection.countDocuments({}, function(error, numOfDocs) {
            console.log('I have '+numOfDocs+' documents in my collection');
        });

        // pretty print JSON data in MongoDB
        collection.find({}).toArray(function(err, result) {
            res.write(JSON.stringify(result, null, 2));
            res.end();
        });

    });
    client.close();
});

module.exports = router

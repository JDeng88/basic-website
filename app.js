/*
 *  Date Created: July 12, 2020
 *  Author: Justin Deng, Yuxuan Zou, Darren Wang
 *  Description: Login Page powered by MongoDB and incorporates password encryption
 */

const express = require('express');                         // returns a method using express
const app = express();                                      // gets an express object from the mthod
const path = require('path');                               // provides path functions
const expressSession = require('express-session');          // allows create sessions, cookies
const bodyParser = require('body-parser');                  // allows to retrieve information from html items
const assert = require('assert');                           // testing for any errors
const MongoClient = require('mongodb').MongoClient;         // returns a MongoDB client
const checkAuth = require('./authentication.js').checkAuth; // custom method from authentication.js for authentication

// Login information for MongoDB
const MONGOD_USER = "madproductive";
const MONGOD_PWD = "wewillpushforward";
const DB_NAME = "test";
const uri = "mongodb+srv://"+MONGOD_USER+":"+MONGOD_PWD+
            "@cluster0.jd51y.mongodb.net/"+DB_NAME+"?retryWrites=true&w=majority";


app.use(bodyParser.urlencoded({ extended: true })); 
// Set dashboard to only be accessed if authorized
app.use(expressSession({secret : '/dashboard', 
                        saveUninitialized: true, 
                        resave : false})); 
app.listen(3000);       // hosted on port 3000

// temporary username and password for testing
var realUser; 
var realPwd;

// GET REQUESTS, Linking html to pages ====================================================================
// req => sending from client
// res => recieving from server
app.get('/', function(req,res){
    if (!req.session.user_id) res.sendFile(path.join(__dirname+'/static/login.html'));
    else res.redirect('/dashboard');
});

app.get('/dashboard', checkAuth, function(req,res){
    res.sendFile(path.join(__dirname+'/static/dashboard.html'));
});

app.get('/register', function(req,res){
    res.sendFile(path.join(__dirname+'/static/register.html'));
});

// POST REQUESTS ===========================================================================================
app.post('/login_form', function(req,res){
    var user = req.body.log_user;
    var pwd = req.body.log_pwd;
    if(user === realUser && pwd === realPwd){
        req.session.user_id = user;              // create a session with the user's username
        req.session.cookie.maxAge = 3600000 * 6; // session expires in 6 hours
        res.redirect('/dashboard');
    }
    else res.redirect('/');
});

app.post('/register_form', function(req,res){
    realUser = req.body.reg_user;
    realPwd = req.body.reg_pwd;
    res.redirect('/');
});

// testing MongoDB connection
app.post('/connect', function(req,res){
    res.redirect('/testing_mongodb');
});

app.get('/testing_mongodb', function(req,res){
    console.log("Welcome to testing platform for MongoDB!");
    
    var myobj = { name: "Company Inc", address: "Highway 37" };
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
    client.connect(err => {
        if(err) return err;
        console.log("Connected to MongoDB!");
        const collection = client.db(DB_NAME).collection("devices"); // db is databse, collection is table
        collection.insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("Inserted Company Inc");
        });
        console.log("Attempting to retrieve one entry...");
        collection.findOne({}, function(err, result) {
            if (err) throw err;
            console.log('Entry name retrieved is: ' + result.name);
        });
        
        // count the number 
        collection.countDocuments({}, function(error, numOfDocs) {
            console.log('I have '+numOfDocs+' documents in my collection');
        });

    });
    client.close();
});
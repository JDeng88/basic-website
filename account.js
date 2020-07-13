const express = require('express');
const router = express.Router();                            // used for refactoring code 
const path = require('path');                               // provides path functions
const MongoClient = require('mongodb').MongoClient;         // returns a MongoDB client
const checkAuth = require('./authentication.js').checkAuth; // custom method from authentication.js for authentication
const bcrypt = require('bcrypt');
const saltRounds = 10;
var validator = require("email-validator");

// Login information for MongoDB

const MONGOD_USER = "xxxxx";
const MONGOD_PWD = "xxxxxx";
var DB_NAME_LOGIN = "login"; // database name
var uri = "mongodb+srv://"+MONGOD_USER+":"+MONGOD_PWD+
            "@cluster0.jd51y.mongodb.net/"+DB_NAME_LOGIN+"?retryWrites=true&w=majority";

// GET REQUESTS, Linking html to pages ====================================================================
// req => sending from client
// res => recieving from server
router.get('/', function(req,res){ // facebook.com
    if (!req.session.user_id) res.sendFile(path.join(__dirname+'/static/account/login/login.html'));
    else res.redirect('/dashboard');
});

router.get('/dashboard', checkAuth, function(req,res){ //facebook.com/dashboard
    res.sendFile(path.join(__dirname+'/static/dashboard/dashboard.html'));
});

router.get('/register', function(req,res){ //facebook.com/register
    res.sendFile(path.join(__dirname+'/static/account/register/register.html'));
});

// POST REQUESTS ===========================================================================================
router.post('/login_form', function(req,res){
    var username = req.body.log_user;
    var pwd = req.body.log_pwd;
    var is_pwd_correct;
    const collection = client.db(DB_NAME_LOGIN).collection("login_information"); // db is databse, collection is table
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
    client.connect(err => {
        if(err) throw err;
        collection.findOne({email : inp_email}, function(err, item){
            const collection = client.db(DB_NAME_LOGIN).collection("login_information"); // db is databse, collection is table
            if(err){ // does it throw error if not found?
                collection.insertOne(user_data, function(err, res) {
                    if(err) throw err;
                    console.log("User has successfully registered.");
                });
                res.redirect('/');
            }
            else res.redirect('/register');
        });
    });
    var user_data = collection.find({username: username});
    var hash = user_data.password;
    bcrypt.compare(pwd, hash, function(err, result){ //checks if password is correct
        is_pwd_correct = result;
    });
    if(username ===  user_data.username && is_pwd_correct){
        console.log("Sucessfuly authenticated!");
        req.session.user_id = email;              // create a session with the user's username
        req.session.cookie.maxAge = 3600000 * 6; // session expires in 6 hours
        res.redirect('/dashboard');
    }
    else res.redirect('/');
});

// Registering site
router.post('/register_form', function(req,res){
    const inp_email = req.body.reg_email;
    const inp_user = req.body.reg_user;

    var user_data = {email : inp_email,
                     username : inp_user, 
                     password : ""}; // object information for the user

    bcrypt.hash(req.body.reg_pwd, saltRounds, function(err, hash){
        user_data.password = hash;
    });
    
    // creating the MongoDB
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

    client.connect(err => {
        if(err) throw err;
        const collection = client.db(DB_NAME_LOGIN).collection("login_information"); // db is databse, collection is table
        if (validator.validate(inp_email)){
            collection.findOne({email: inp_email}, function(err, result){
                if(result){ // there is a duplicate
                    console.log("Duplicate email found");
                }else{ // does not exist
                    collection.findOne({username: inp_user}, function(err, result){
                        if(result){ // if it exits
                            console.log("Duplicate user found");
                        }else{
                            collection.insertOne(user_data, function(err, res) {
                                if(err) throw err;
                                console.log("User has successfully registered.");
                            }); 
                        }
                    });
                }
            });
        }
    });
    client.close();
    res.redirect('/register');
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
        const collection = client.db(DB_NAME_LOGIN).collection("login_information"); // db is databse, collection is table

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
/**
 * 
 * Database
 * // stuff here (ideas)
 * register page, email confirmation
 * forgot page, temporary password
 * -----------------------------------------------------------------
 *  (for customers)
 *  email                                                            
 *  username                                                                
 *  password (hashed)                                                   
 *  address 
 */
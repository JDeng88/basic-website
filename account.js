const express = require('express');
const router = express.Router();                            // used for refactoring code 
const path = require('path');                               // provides path functions
const MongoClient = require('mongodb').MongoClient;         // returns a MongoDB client
const checkAuth = require('./authentication.js').checkAuth; // custom method from authentication.js for authentication
const bcrypt = require('bcrypt');                           // module for encrypting strings (for password)
const validator = require("email-validator");               // validate whether an email is real
const saltRounds = 10;                                      // for encryption (the higher the better the security is)

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

router.get('/dashboard', checkAuth,function(req,res){ //facebook.com/dashboard
    if(req.session.user_id) res.sendFile(path.join(__dirname+'/static/dashboard/dashboard.html'));
    else redirect('/');
});

router.get('/register', function(req,res){ //facebook.com/register
    res.sendFile(path.join(__dirname+'/static/account/register/register.html'));
});

// POST REQUESTS ===========================================================================================
router.post('/login_form', function(req,res){
    var username = req.body.log_user;
    var pwd = req.body.log_pwd;
    const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
    console.log("Connecting...");
    client.connect(err => {
        if(err) throw err;
        console.log("Connected to mongo");
        const collection = client.db(DB_NAME_LOGIN).collection("login_information"); // db is databse, collection is table
        collection.findOne({username : username}, function(err, item){
            console.log("Found someone who is " + username);
            if(item){
                // want username or email as login?
                var db_pwd = item.password;
                bcrypt.hash(pwd, saltRounds, function(err, hash){
                    pwd = hash;
                });
                bcrypt.compare(pwd, db_pwd, function(err, isMatch){ //checks if password is correct
                    if(err) throw err;
                    if(isMatch){
                        req.session.user_id = "username";              // create a session with the user's username
                        req.session.cookie.maxAge = 36000000 * 6;      // session expires in 6 hours
                        req.session.save();
                        res.redirect('/dashboard');
                        console.log("Information is correct");
                    }else{
                        console.log("Wrong password");
                        res.redirect('/');
                    }
                });
            }else{
                console.log("Username is not registered.");
                res.redirect('/');
            }
        });
    });
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
    res.redirect('/');
});


// testing MongoDB connection
router.post('/connect_form', function(req,res){
    res.redirect('/testing_mongodb');
});

router.get('/testing_mongodb', function(req,res){    
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

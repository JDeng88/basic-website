const express = require('express');                 // returns a method using express
const app = express();                              // gets an express object from the mthod
const path = require('path');                       // provides path functions
const expressSession = require('express-session');  // allows create sessions, cookies
const bodyParser = require('body-parser');          // allows to retrieve information from html items

const checkAuth = require('./authentication.js').checkAuth; // custome method from authentication.js

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(expressSession({secret: '/dashboard', saveUninitialized: true, resave: false}));
app.listen(3000); // hosted on port 3000

// temporary username and password for testing
var realUser;
var realPwd;

// GET REQUESTS, Linking html to pages
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

// POST REQUESTS
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
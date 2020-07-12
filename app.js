const express = require('express'); // returns a method using express
const app = express();              // gets an express object from the mthod
const path = require('path');       // provides path functions
const expressSession = require('express-session');  // allows create sessions, cookies
const bodyParser = require('body-parser');          // allows to retrieve information from html items
const mongo = require('mongodb').MongoClient;

const checkAuth = require('./authentication.js').checkAuth;

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(expressSession({secret: '/dashboard', saveUninitialized: true, resave: false}));
app.listen(3000);

// temp username and password for testing
var realUser;
var realPwd;

/*
// Mongodb
const url = 'mongodb://localhost:3000';
mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
    if (err) {
        console.error(err)
        return
    }
});
*/

// GET REQUESTS, Linking html to pages
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
        req.session.user_id = user;
        req.session.cookie.maxAge = 3600000 * 6;
        res.redirect('/dashboard');
    }
    else res.redirect('/');
});

app.post('/register_form', function(req,res){
    realUser = req.body.reg_user;
    realPwd = req.body.reg_pwd;
    res.redirect('/');
});
'use strict'

const express = require('express');
const oauth = require('./module');
const app = express();
const session = require('express-session');

app.use(session({
    secret: process.env.CLIENT_ID || 'hoge',
    resave: false,
    saveUninitialized: false
}));

const port = (process.env.PORT || 5000);
const server = app.listen(port, function(){
    console.log('Server is running on port ' + port);
});

app.use('/oauth', oauth({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    flow: 'code',
    workspace: process.env.WORKSPACE,
    login_url: '/login',
    logout_url: '/logout'
}));

app.get('/', function(req, res, next){
    if (req.session.oauth){
        res.redirect('/login');
    } else {
        res.redirect('/oauth');
    }
});

app.get('/login', function(req, res, next){
    if (req.session.oauth){
        res.json(req.session.oauth);
    }
});

app.get('/logout', function(req, res, next){
    res.send('Logged out.');
});

module.exports = app;

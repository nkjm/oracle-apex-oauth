'use strict'

const express = require('express');
const oauth = require('./oracle-apex-oauth/index.js');
const app = express();
const session = require('express-session');

app.use(session({
    secret: process.env.CLIENT_ID,
    resave: false,
    saveUninitialized: false
}));

const port = (process.env.PORT || 5000);
const server = app.listen(port, function(){
    console.log('Server is running on port ' + port);
});

app.use('/oauth', oauth({
    session_secret: process.env.SESSION_SECRET,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    flow: 'code',
    workspace: process.env.WORKSPACE,
    redirect_url: '/'
}));

app.get('/', function(req, res, next){
    if (req.session.oauth){
        res.json(req.session.oauth);
    } else {
        res.send('This is /');
    }
});

module.exports = app;

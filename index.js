'use strict'

const express = require('express');
const oauth = require('./oracle-apex-oauth/index.js');
const app = express();

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
    res.send('This is /');
});

module.exports = app;

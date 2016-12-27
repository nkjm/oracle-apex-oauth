'use strict';

const express = require('express');
const app = express();
const session = require('express-session');
const uuid = require('uuid');
const request = require('request');
const oracleApexOauth = require('./oracle-apex-oauth');

module.exports = function(options){

    app.use(session({
        secret: options.client_id,
        resave: false,
        saveUninitialized: false
    }));

    app.get('/', function(req, res, next){
        let oauth = new oracleApexOauth(req.session, options.workspace, options.flow, options.client_id, options.client_secret, options.redirect_url);

        if (req.query.code){
            // This is the redirect of Authentication Code Flow.
            oauth.aquireAccessToken(req.query.code, req.query.state, function(response){
                res.redirect(options.redirect_url);
            }, function(response){
                res.status(401).send(response);
            });
        } else {
            // This is the initiation of OAuth.
            oauth.inititate(res, options.flow);
        }
    });

    app.get('/refresh', function(req, res, next){
        let oauth = new oracleApexOauth(req.session, options.workspace, options.flow, options.client_id, options.client_secret, options.redirect_url);
        oauth.refreshAccessToken(function(response){
            res.redirect(options.redirect_url);
        }, function(response){
            res.status(401).send(response);
        });
    });

    return app;
}

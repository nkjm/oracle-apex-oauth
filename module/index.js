'use strict';

const express = require('express');
const router = express.Router();
const session = require('express-session');
const oracleApexOauth = require('./oracle-apex-oauth');

module.exports = function(options){

    if (typeof options.client_id == 'undefined' ||
        typeof options.client_secret == 'undefined' ||
        typeof options.workspace == 'undefined'){
            throw new Error('Required options not set.');
    }
    if (typeof options.flow == 'undefined'){
        options.flow = 'code';
    }

    router.get('/', function(req, res, next){
        let oauth = new oracleApexOauth(req.session, options.workspace, options.flow, options.client_id, options.client_secret, options.redirect_url);

        if (req.query.code){
            // Request is the redirect of Authentication Code Flow.
            oauth.acquireAccessToken(req.query.code, req.query.state, function(response){
                if (options.login_url){
                    res.redirect(options.login_url);
                    return;
                }
                res.json(response);
            }, function(response){
                res.status(401).send(response);
            });
        } else if (req.session.oauth.flow && req.session.oauth.flow == 'implicit'){
            // Request is the redirect of Implicit Flow.
            /*
             * This code block will not be used since the redirect url should be other than this url in case of implicit flow.
             */
            res.status(200).end();
        } else {
            // Request is the initiation of OAuth.
            let initiateUrl = oauth.getInitiateUrl(options.flow);
            console.log("Going to redirect user to " + initiateUrl);
            res.redirect(initiateUrl);
        }
    });

    router.get('/refresh', function(req, res, next){
        let oauth = new oracleApexOauth(req.session, options.workspace, options.flow, options.client_id, options.client_secret, options.redirect_url);
        oauth.refreshAccessToken(function(response){
            if (options.login_url){
                res.redirect(options.login_url);
                return;
            }
            res.json(response);
        }, function(response){
            res.status(401).send(response);
        });
    });

    router.get('/logout', function(req, res, next){
        if (req.session.oauth){
            delete req.session.oauth;
        }
        if (options.logout_url){
            res.redirect(options.logout_url);
            return;
        }
        res.status(200).end();
    });

    return router;
}

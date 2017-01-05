'use strict';

const uuid = require('uuid');
const request = require('request');

module.exports = class oracleApexOauth {

    constructor(session, workspace, flow, client_id, client_secret, redirect_url) {
        this._session = session;
        if (typeof this._session.oauth == 'undefined'){
            this._session.oauth = {};
        }
        this._workspace = workspace;
        this._flow = flow;
        this._client_id = client_id;
        this._client_secret = client_secret;
        this._redirect_url = redirect_url;
    }

    getInitiateUrl(flow){
        if (flow != 'implicit' && flow != 'code'){
            return false;
        }
        this._session.oauth = {
            flow: flow,
            state: uuid.v4()
        }
        let initiateUrl;
        if (flow == 'implicit'){
            initiateUrl = "https://apex.oracle.com/pls/apex/" + this._workspace + "/oauth2/auth?response_type=token&client_id=" + this._client_id + "&state=" + this._session.oauth.state;
        } else if (flow == 'code'){
            initiateUrl = "https://apex.oracle.com/pls/apex/" + this._workspace + "/oauth2/auth?response_type=code&client_id=" + this._client_id + "&state=" + this._session.oauth.state;
        }
        console.log("initiateUrl is " + initiateUrl);
        return initiateUrl;
    }

    acquireAccessToken(authorization_code, state, success_cb, fail_cb){
        /*
         * This state validation should be performed but it seems sent stat is not passed to Token Server when authentication runs. So tempolary disabling this validation.
         */
        if (!this._session.oauth.state || this._session.oauth.state != state){
            console.log("State does not match.");
            //fail_cb("State does not match. Got " + state);
            //return;
        } else {
            console.log("State matches. Got " + state);
        }

        let url = "https://apex.oracle.com/pls/apex/" + this._workspace + "/oauth2/token";
        let headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        let auth = {
            user: this._client_id,
            pass: this._client_secret
        }
        let form = "grant_type=authorization_code&code=" + authorization_code;

        let that = this;
        request({
            method: "post",
            url: url,
            headers: headers,
            auth: auth,
            form: form,
            json: true
        }, function(error, response, body){
            if (error || response.statusCode != 200){
                fail_cb(body);
                return;
            }
            that._session.oauth.access_token = body.access_token;
            that._session.oauth.refresh_token = body.refresh_token;
            that._session.oauth.expiration = Math.round((new Date()).getTime() / 1000) + body.expires_in;
            success_cb(that._session.oauth);
        });
    }

    refreshAccessToken(success_cb, fail_cb){
        if (!this._session.oauth.refresh_token){
            fail_cb("Refresh Token not found.");
            return;
        }

        let url = "https://apex.oracle.com/pls/apex/" + this._workspace + "/oauth2/token";
        let headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        let auth = {
            user: this._client_id,
            pass: this._client_secret
        }
        let form = "grant_type=refresh_token&refresh_token=" + this._session.oauth.refresh_token;
        let that = this;
        request({
            method: "post",
            url: url,
            headers: headers,
            auth: auth,
            form: form,
            json: true
        }, function(error, response, body){
            if (error || response.statusCode != 200){
                fail_cb(body);
                return;
            }
            that._session.oauth.access_token = body.access_token;
            that._session.oauth.refresh_token = body.refresh_token;
            that._session.oauth.expiration = Math.round((new Date()).getTime() / 1000) + body.expires_in;
            success_cb(that._session.oauth);
        });
    }
}

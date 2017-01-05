[English README](https://github.com/nkjm/oracle-apex-oauth/README.en.md)

# What is this?

The npm package which allows 3rd party applications to access to the OAuth protected REST API hosted by apex.oracle.com.

# Installation

```
$ npm install oracle-apex-oauth --save
```

# How to use?

Mount oracle-apex-oauth middleware on the path you like to initiate OAuth authentication flow.
In the following example, OAuth authentication flow starts when user access to /oauth.

```
const oauth = require('oracle-apex-oauth');

app.use('/oauth', oauth({
    client_id: 'YOUR_CLIENT_ID', // Required.
    client_secret: 'YOUR_CLIENT_SECRET', // Required.
    workspace: 'YOUR_APEX_WORKSPACE', // Required.
    flow: 'code', // Option. 'code' or 'implicit'. default is 'code'.
    login_url: '/', // Option. The URL where user is redirect to after acquiring token.
    logout_url: '/' // Option. The URL where user is redirect to after logout.
}));
```

CLIENT_ID and CLIENT SECRET can be generated at https://apex.oracle.com/pls/apex/YOUR_APEX_WORKSPACE/ui/oauth2/clients/ by creating the Client.

When the authentication is successful, 3rd party application can retrieve access token from session.

```
const session = require('express-session');

app.use(session({
    secret: 'YOUR_CLIENT_ID',
    resave: false,
    saveUninitialized: false
}));

app.get('/', function(req, res, next){
    if (req.session.oauth){
        res.json(req.session.oauth);
    } else {
        res.send('No Token.');
    }
});
```

While the access token expires after the specified period, 3rd party application can extend it by using refresh token.
To extend the life of access token, access /oauth/refresh if you mount oracle-apex-oauth on /oauth.

The access token is saved in the server-side session. If you like to delete it, access /oauth/logout if you mount oracle-apex-oauth on /oauth. But please be noted that this operation just deletes the token from server-side session but does not disable the token itself. Which means the token is stile valid at apex.oracle.com even if you did logout at 3rd party application.

Also be noted that oracle-apex-oauth uses default cache of express-session as token store which is for development. If you apply this application to production environment, you should replace the store to other persistent store.

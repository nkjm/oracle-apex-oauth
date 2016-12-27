# 概要

apex.oracle.comのRESTful ServicesでOAuth2.0で保護されたAPIにNodeアプリからアクセスするためのnpm packageです。

# インストール

```
$ npm install oracle-apex-oauth
```

# 利用方法

認証

```
const oauth = require('oracle-apex-oauth');

app.use('/oauth', oauth({
    client_id: 'あたたのClient Id',
    client_secret: 'あなたのClient Secret',
    flow: 'code', // codeまたはimplicit
    workspace: 'あなたのAPEX WORKSPACE',
    redirect_url: '/' // トークン取得後にリダクレクトされるURL
}));
```

認証が成功すると、アクセストークンはセッションから取得できます。

```
const session = require('express-session');

app.use(session({
    secret: 'あなたのClient Id',
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

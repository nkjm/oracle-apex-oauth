# 概要

apex.oracle.comのRESTful ServicesでOAuth2.0で保護されたAPIにNodeアプリからアクセスするためのnpm packageです。

# インストール

```
$ npm install oracle-apex-oauth --save
```

# 利用方法

認証をおこなうには認証を開始したいパスにoracle-apex-oauthをマウントします。
下記の例では/oauthにアクセスすると認証が開始されます。

```
const oauth = require('oracle-apex-oauth');

app.use('/oauth', oauth({
    client_id: 'あたたのCLIENT ID', // 必須
    client_secret: 'あなたのCLIENT SECRET', // 必須
    workspace: 'あなたのAPEX WORKSPACE', 必須
    flow: 'code', // オプション codeまたはimplicit デフォルトはcode
    login_url: '/', // オプション トークン取得後にリダクレクトされるURL
    logout_url: '/' // オプション ログアウト（トークン削除）後にリダイレクトされるURL
}));
```

CLIENT_ID, CLIENT_SECRETは https://apex.oracle.com/pls/apex/あなたのワークスペース/ui/oauth2/clients/ Clientを登録することで作成できます。

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

アクセストークンには期限が設定されていますが、Refreshトークンを使って延長することができます。
延長するには、/oauthを認証開始パスに設定した場合は/oauth/refreshにアクセスします。

また、アクセストークンはサーバー側のセッション（express-session）に格納されていますが、これを削除（ログアウト）するには、/oauthを認証開始パスに設定した場合には/oauth/logoutにアクセスします。ただし、この操作は単にNodeの実行環境からトークン情報を削除するだけで、apex.oracle.com側では依然として削除したトークンは有効です。

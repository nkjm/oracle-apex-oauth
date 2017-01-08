[Go to English README](./README.en.md)

# 概要

apex.oracle.comのRESTful ServicesでOAuth2.0で保護されたAPIにNodeアプリからアクセスするためのnpm packageです。

# インストール

```
$ npm install oracle-apex-oauth --save
```

# 利用方法

oracle-apex-oauthはexpress-sessionパッケージでセッション管理をすることが前提となっています。したがってまずexpress-sessionをインポートし、適当な設定とともにマウントします。

```
const session = require('express-session');

app.use(session({
    secret: 'あなたの秘密鍵', // セッションID cookieに署名するための秘密鍵。任意の文字列でOKです。
    resave: false,
    saveUninitialized: false
}));
```

次に、認証を開始したいパスにoracle-apex-oauthをマウントします。
下記の例では/oauthにアクセスすると認証が開始されます。

```
const oauth = require('oracle-apex-oauth');

app.use('/oauth', oauth({
    client_id: 'あたたのCLIENT ID', // 必須
    client_secret: 'あなたのCLIENT SECRET', // 必須
    workspace: 'あなたのAPEX WORKSPACE', // 必須
    flow: 'code', // オプション codeまたはimplicit デフォルトはcode
    login_url: '/', // オプション トークン取得後にリダクレクトされるURL
    logout_url: '/' // オプション ログアウト（トークン削除）後にリダイレクトされるURL
}));
```

CLIENT_ID, CLIENT_SECRETは https://apex.oracle.com/pls/apex/あなたのワークスペース/ui/oauth2/clients/ でClientを登録することで作成できます。

認証が成功すると、アクセストークンはセッションから取得できます。

```
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

また、oracle-apex-oauthはトークンの格納先としてexpress-sessionのデフォルトであるMemoryStoreを使用していますが、これは開発目的専用のストレージです。本番環境に適用する場合は下記の例のようにこのストレージを他のストレージ実装に変更する必要があります。

```
const session = require('express-session');
const mongo = require('connect-mongo')(session);
const store = new mongo({ url: 'YOUR_MONGO_URI' });

app.use(session({
    secret: 'YOUR_SECRET_KEY',
    resave: false,
    saveUninitialized: false,
    store: store // Added
}));
```

上の例ではMongoDBをストレージとして使用しています。

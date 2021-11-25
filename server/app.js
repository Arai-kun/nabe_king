let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');

mongoose.connect(
    "mongodb://localhost:27017/nabe_king?authSource=admin",
    {
        useNewUrlParser: true,
        user: "admin",
        pass: "Bach01070202"
    }
);

let db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');

let User = require('./models/user');

let authRouter = require('./routes/authRouter');
let dbRouter = require('./routes/dbRouter');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'nabe_king',      // クッキーの暗号化に使用するキー
    resave: false,             // セッションチェックする領域にリクエストするたびにセッションを作り直してしまうので false
    saveUninitialized: false,  // 未認証時のセッションを保存しないようにする
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,  // クッキーの有効期限は1日
      secure: true                 // HTTP 利用時は false にする
    }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy({
    usernameField: 'email',  // POST の body から参照するフィールド名を指定する
    passwordField: 'password',  // POST の body から参照するフィールド名を指定する
    session: true,              // セッションを有効にする
    //passReqToCallback: true     // 次のコールバック関数の第1引数に request を渡す
  }, (email, password, done) => {
    // ココでは userName と password が固定値と合致すれば、ログインして良いユーザと見なす
    // (実際は DB のデータと照合したりして実装する)
    User.findOne({email: email}, function(error, user){
      if(error) next(error);
      if(!user){
        //console.log('Invalid name')
        return done(null, false, { message: 'メールアドレスが間違っています' });
      }
  
      //password検証ロジック
      if(!passwordValidator(password, user.password)){
        return done(null, false, { massage: 'パスワードが間違っています' })
      }
  
      //console.log('valid user');
      const authUser = {
        auth: true,
        email: user.email
      };
      return done(null, authUser);　//この第二引数がsessionに保存される
    });
}));
  
// シリアライズ処理
passport.serializeUser((authUser, done) => {
    done(null, authUser);
});
    
// デシリアライズ処理
passport.deserializeUser((authUser, done) => {
    User.findOne({email: authUser.email}, function(error, user){
        done(error, user);
    })
});
  
function passwordValidator(reqPassword, dbPassword) {
    return bcrypt.compareSync(reqPassword, dbPassword);
}

app.use('/auth', authRouter);
app.use('/user', dbRouter);

app.use(express.static(path.join(__dirname, '../client/dist/client')));
app.use('/*', express.static(path.join(__dirname, '../client/dist/client/index.html')));

module.exports = app;

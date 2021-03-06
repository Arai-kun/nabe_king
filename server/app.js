let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let createError = require('http-errors')
let logger = require('morgan');
let mongoose = require('mongoose');
let cloudinary = require('cloudinary').v2;
let compression = require('compression');
const sendgrid = require('@sendgrid/mail');
require('dotenv').config();

mongoose.connect(
    "mongodb://localhost:27017/rakucomeDb?authSource=admin",
    {
        useNewUrlParser: true,
        user: "admin",
        pass: process.env.DB_ADMINPW
    }
);

let db = mongoose.connection;
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose");
});

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
});

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');

let User = require('./models/user');

let authRouter = require('./routes/authRouter');
let dbRouter = require('./routes/dbRouter');
let fileRouter = require('./routes/fileRouter');
let mailRouter = require('./routes/mailRouter');

let app = express();

app.use(compression());
app.enable('trust proxy');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,      // クッキーの暗号化に使用するキー
    resave: false,             // セッションチェックする領域にリクエストするたびにセッションを作り直してしまうので false
    saveUninitialized: false,  // 未認証時のセッションを保存しないようにする
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,  // クッキーの有効期限は1日
      secure: true                 // HTTP 利用時は false にする
    },
    proxy: true
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
      return done(null, authUser); //この第二引数がsessionに保存される
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

function isLogined(req, res, next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.status(401);
    res.json({message: 'Unauthorized'})
  }
}

app.use('/auth', authRouter);
app.use('/user', isLogined, dbRouter);
app.use('/file', isLogined, fileRouter);
app.use('/mail', isLogined, mailRouter);

app.use(express.static(path.join(__dirname, '../client/dist/client')));
app.use('/*', express.static(path.join(__dirname, '../client/dist/client/index.html')));

// catch 404 and forward to error handler => Angular in charge of this process
/*
app.use(function(req, res, next) {
  next(createError(404));
});
*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('Something error happens!');
});

module.exports = app;

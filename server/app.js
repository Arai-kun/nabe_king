let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let authRouter = require('./routes/authRouter');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/dist/client')));
app.use('/*', express.static(path.join(__dirname, '../client/dist/client/index.html')));

app.use('/auth', authRouter);

module.exports = app;

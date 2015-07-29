var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('dotenv').load();

var routes = require('./routes/index');

var app = express();
var port = process.env.PORT || 8080;
var io = require('socket.io').listen(app.listen(port));


io.sockets.on('connection', function (socket) {
  socket.on('draw', function (data) {
    socket.broadcast.emit('draw', data);
  });

  socket.on('editorUpdate', function (data) {
    socket.broadcast.emit('editorUpdate', data);
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(require('express-session')({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/whiteboard', function (req, res) {
  res.render('whiteboard');
});

app.get('/codeeditor', function (req, res) {
  res.render('codeeditor');
});

app.use('/', routes);
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
//mongoose.connect(process.env.MONGOLAB_URI_LOCAL); // local
mongoose.connect(process.env.MONGOLAB_URI); // heroku

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

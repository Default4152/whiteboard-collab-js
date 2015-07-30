var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(expressSession);
require('dotenv').load();
var User = require('./models/account');
var PastebinAPI = require('pastebin-js');
var pastebin = new PastebinAPI('d5ee05860f0fa9063c5d39302e29a144');
pastebin = new PastebinAPI({
  'api_dev_key': 'd5ee05860f0fa9063c5d39302e29a144',
  'api_user_name': 'javascriptguy',
  'api_user_password': process.env.pastebinPass
});

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
app.use(expressSession({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/whiteboard', function (req, res) {
  var previous = req.session.value || 0;
  req.session.value = previous + 1;
  res.render('whiteboard', {
    user: req.user
  });
});

app.get('/codeeditor', function (req, res) {
  res.render('codeeditor', {
    user: req.user
  });
});

app.get('/profile', function(req, res) {
  res.render('profile', {
    user: req.user
  });
});

app.use('/', routes);
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
//mongoose.connect(process.env.MONGOLAB_URI_LOCAL); // local
mongoose.connect(process.env.MONGOLAB_URI); // heroku

//pastebin
app.post('/pasteme', function (req, res) {
  //console.log(req.user);
  var o = JSON.stringify(req.body.code, null, 4);
  o = JSON.parse(o);
  pastebin
    .createPaste(o, "", 'javascript')
    .then(function (data) {
      console.log(data);
      User.findOneAndUpdate({username: req.user.username}, {$push: {bins: data}}, function(err, user) {
        if (err) throw err;
        console.log(user);
      });
    })
    .fail(function (err) {
      console.log(err);
    });
  res.redirect('/codeeditor');
});


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

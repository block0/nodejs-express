var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var busboy = require('connect-busboy');

// Main app
var device = require('./routes/device');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy({ immediate: true }));

// Session store
var session = require('express-session');
app.use(session({
  secret: '3xxi3388'
}));

// connect to MongoDB server and provide the collection schema
app.use(function(req, res, next) {
  if (typeof app.db !== 'undefined')
    next();

  mongoose.connect('mongodb://jollen:123456@ds035766.mlab.com:35766/measurements');
  var db = mongoose.connection;

  db.once('open', function callback () {
    console.log('MongoDB: connected.');

    // User system schema
    var deviceSchema = mongoose.Schema({
        DeviceId: String,
        Value: String,
    });

    app.db = {
      model: {
        Device: mongoose.model('Device', deviceSchema)
      }
    };

    next();
  });
});

app.use('/1/device', device);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

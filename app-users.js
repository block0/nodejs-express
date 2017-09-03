var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var busboy = require('connect-busboy');

// Passport
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
var FACEBOOK_APP_ID = '752090094976053';
var FACEBOOK_APP_SECRET = 'a1c36c47b495e45ec3e5282906a993c6';

// Main app
var users = require('./routes/users');
var posts = require('./routes/posts');

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

  mongoose.connect('mongodb://jollen:qazwsx@ds151242.mlab.com:51242/vcard');
  var db = mongoose.connection;

  db.once('open', function callback () {
    console.log('MongoDB: connected.');

    // User system schema
    var userSchema = mongoose.Schema({
        Name: String,
        Phone: String,
        Email: String,
        Address: String,
        Age: Number,
        Passport: {
          facebook: {
            id: String,
            accessToken: String,
            refreshToken: String
          }
        }
    });

    // Blog system schema
    var postSchema = mongoose.Schema({
        title: { type: String, default: 'No title' },
        content: { type: String, default: 'No content' },
        UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        TimeCreated: { type: Date, default: Date.now }
    });

    app.db = {
      model: {
        User: mongoose.model('User', userSchema),
        Post: mongoose.model('Post', postSchema)        
      }
    };

    next();
  });
});

//
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  app.db.model.User.findOne({_id: id}, function(err, user) {
    done(null, user);                                       
  });  
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/login/return"
  },
  function(accessToken, refreshToken, profile, done) {
    app.db.model.User.findOne({"Passport.facebook.id": profile._json.id}, function(err, user) {
        if (!user) {
          var obj = {
            Name: profile.displayName,
            Passport: {
              facebook: {
                id: ''+ profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken
              }
            }
          };
    
          var doc = new app.db.model.User(obj);
          doc.save();
    
          user = doc;
        }
    
        return done(null, user); // verify callback                                         
    });
  }
)); 

app.get('/login', passport.authenticate('facebook'));
app.get('/login/return', passport.authenticate('facebook', { failureRedirect: '/login/fail' }),
  function(req, res, next) {
    res.redirect(req.session.returnTo);
  });
app.use('/users', users);
app.get('/users', require('connect-ensure-login').ensureLoggedIn({ 
  setReturnTo: '/users', 
  redirectTo: '/login'
}));

app.use('/', posts);

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

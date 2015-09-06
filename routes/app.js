var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var TwitterStrategy = require('passport-twitter');
var fbConfig = require('../config/passport-facebook');
var bodyParser = require('body-parser');
var urlencoded = bodyParser.urlencoded({extended: false});
var twitterConfig = require('../config/passport-twitter');
var app = express.Router();

var tempUser = null;
var session = null;
var currentUser = null;

app.get('/', ensureAuthenticated, function(req, res) {
  res.render('app/index', {layout: 'app', user: currentUser});
});

app.get('/signup', function(req, res) {
  console.log(tempUser);
  res.render('landing/index', {layout: 'landing', tempUser: tempUser});
});

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // function will not be called.
});

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // function will not be called.
});

app.get('/auth/facebook/callback', urlencoded, function(req, res, next) {
  passport.authenticate('facebook', { failureRedirect: '/' }, function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send({
        success : false,
        message : 'authentication failed'
      });
    }
    else if (user && (user.registered === true)) {
      passport.serializeUser(function(user, done) {
        done(null, user._id);
      });
      session = true;
      currentUser = user;
      return res.redirect('/');
    }
    else if (user && (user.registered === false)) {
      tempUser = user;
      return res.redirect('/signup');
    }
    })(req, res, next);
});

app.get('/auth/twitter/callback', urlencoded, function(req, res, next) {
  passport.authenticate('twitter', { failureRedirect: '/' }, function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send({
        success : false,
        message : 'authentication failed'
      });
    }
    else if (user && (user.registered === true)) {
      passport.serializeUser(function(user, done) {
        done(null, user._id);
      });
      session = true;
      currentUser = user;
      return res.redirect('/');
    }
    else if (user && (user.registered === false)) {
      tempUser = user;
      return res.redirect('/signup');
    }
    })(req, res, next);
});

app.get('/logout', function(req, res){
  session = false;
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (session) {
    return next();
  }
  else {
    res.render('landing/index', {layout: 'landing'});
  }
}

module.exports = app;
var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var urlencoded = bodyParser.urlencoded({extended: false});
var usersCtrl = require('../controllers/users');
var User = require('../models/User');

var users = express.Router();

users.route ('/')
  .get(ensureAuthenticated, usersCtrl.get)
  .post(ensureAuthenticated, urlencoded, usersCtrl.post);

users.route('/usernames')
  .post(ensureAuthenticated, urlencoded, usersCtrl.checkUsernameAvailabiliy);

users.route('/:id')
  .put(ensureAuthenticated, urlencoded, usersCtrl.putUsernameAndPassword);

users.route('/facebook/:id')
  .put(ensureAuthenticated, urlencoded, usersCtrl.updateFacebook);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.render('landing/index', {layout: 'landing'});
}

module.exports = users;
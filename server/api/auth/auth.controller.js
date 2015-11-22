var mongoose = require('mongoose');
var passport = require('passport');

/**
 * Session
 * returns info on authenticated user
 */
exports.session = function (req, res) {
  console.log("Session - " + req.isAuthenticated());

  if(req.user) {
    res.json(req.user.user_info);
  }
  else {
    res.send(400, "Not logged in");
  }
};

exports.isAuthenticated = function (req, res) {
  if (req.isAuthenticated()) {
    return res.json({ isAuthenticated: true });
  }
  res.send(401);
};

/**
 * Logout
 * returns nothing
 */
exports.logout = function (req, res) {
  res.clearCookie('connect.sid');

  if(req.user) {
    req.logout();
    res.send(200);
  } else {
    res.send(400, "Not logged in");
  }
};

/**
 *  Login
 *  requires: {email, password}
 */
exports.login = function (req, res, next) {
  console.log("Login successfully");
  if (req.isAuthenticated()) {
    return res.json({ id: req.user._id, username: req.user.username });
  }
}

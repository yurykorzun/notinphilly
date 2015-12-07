var mongoose = require('mongoose');
var passport = require('passport');

/**
 * Session
 * returns info on authenticated user
 */
exports.session = function (req, res) {
  if(req.isAuthenticated() && req.user) {
    return res.json(req.user);
  }
  else {
    return res.send(400, "Not logged in");
  }
};


exports.checkAuthenticated = function (req, res) {
  if(req.isAuthenticated() && req.user) {
    return res.json({ "user" : req.user, "authenticated" : true });
  }
  return res.json({ "authenticated" : false });
};

/**
 * Logout
 * returns nothing
 */
exports.logout = function (req, res) {
  res.clearCookie('notinphilly.sid');

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
    return res.json({ id: req.user._id, email: req.user.email });
  }
}

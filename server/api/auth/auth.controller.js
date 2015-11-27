var mongoose = require('mongoose');
var passport = require('passport');

/**
 * Session
 * returns info on authenticated user
 */
exports.session = function (req, res) {
  console.log("Session - " + req.isAuthenticated());

  if(req.user) {
    res.json(req.user.userInfo);
  }
  else {
    res.send(400, "Not logged in");
  }
};

exports.isAuthenticated = function (req, res) {
  if (req.isAuthenticated()) {
    if(req.user) {
      next();
    }
    else {
      res.send(400, "Not logged in");
    }
  }
  res.send(401);
};

/**
 * Checks if the user role meets the minimum requirements of the route
 */
exports.hasRole = function (role) {
  if (!role) throw new Error('Required role needs to be set');
  if (req.isAuthenticated()) {
    if(req.user.userInfo.roles.indexOf(role) > -1)
    {
      next();
    }
  }
  res.send(401);
}


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

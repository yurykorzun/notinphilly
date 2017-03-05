var mongoose        = require('mongoose');
var passport        = require('passport');
var serverSettings  = require('../../config/serverSettings');
var logger          = require('../../components/logger');

/**
 * Session
 * returns info on authenticated user
 */
exports.session = function (req, res) {
  if(req.isAuthenticated() && req.user) {
    return res.json(req.user);
  }
  else {
    return res.sendStatus(400, "Not logged in");
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
  res.clearCookie(serverSettings.AUTH_COOKIE_NAME);

  if(req.user) {
    req.logout();
    req.session.save(function (err) {
        if (err) { 
          logger.error("authController.logout " + err);
          next(err); 
        }
    });

    res.sendStatus(200);
  } else {
    logger.error("authController.logout Logout failed, wasn't logged in");
    res.sendStatus(400, "Logout failed, wasn't logged in");
  }
};


/**
 *  Login
 *  requires: {email, password}
 */
exports.login = function (req, res, next) {
    if (req.isAuthenticated() && req.user) {
      return res.json(req.user);
    }

    res.sendStatus(400, "Logout failed");
}

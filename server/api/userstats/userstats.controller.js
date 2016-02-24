var mongoose = require('mongoose');
var UserStatsModel = require('./userstats.model');
var UserController = require('../user/user.controller');
var mailer = require('../../components/mailer');
var uuid = require('uuid');


var saveUserStats = function(userStats, res) {
  userStats.save(function (err) {
    if (err) {
      console.log("Error while saving user" + err);
    } else {
      res.statusCode = 200;
      res.setHeader("Location", "/");
      res.end();
      console.log("Stats has been changed");
    }
  });
}

var createUserStats = function(userId, res) {
  console.log("Created a new user stats");
  UserStatsModel.create(
  {
    checkin: 1,
    uid: userId,
    date: ''
  },
  function(err, thor){

   })
}

/**
 * Checkin the user
 */
exports.checkin = function(req, res, next) {
    var userId = req.params.id;
    console.log(req.user._id);
    if (userId != req.user._id) return res.status(401).send();
   UserStatsModel.findOne({uid: userId}, function(err, userStats) {
       if (err) {
         return next(err);
       }
         if (typeof userStats != 'undefined' && userStats != null) {
         userStats.checkin = userStats.checkin + 1 ;
         saveUserStats(userStats, res);
       }
       else {
         createUserStats(userId, res);
       }
    });
};

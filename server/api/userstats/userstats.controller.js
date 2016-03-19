var mongoose = require('mongoose');
var UserStatsModel = require('./userstats.model');
var UserController = require('../user/user.controller');
var mailer = require('../../components/mailer');
var uuid = require('uuid');
var url = require('url');

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

var createUserStats = function(userId, streetId, res) {
  console.log("Created a new user stats");
  UserStatsModel.create(
  {
    checkin: 1,
    uid: userId,
    sid: streetId,
    date: Date(Date.now())
  },
  function(err, thor){

   })
}

/**
 * Checkin the user
 */
exports.checkin = function(req, res, next) {
    var queryObj = url.parse(req.url, true).query;
     createUserStats(queryObj.uid, queryObj.sid,  res);
};

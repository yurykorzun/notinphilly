var mongoose = require('mongoose');
var crypto   = require('bcrypt-nodejs');
var uuid = require('uuid');
var Schema = mongoose.Schema;

// define our user schema
var userStatsSchema = new Schema({
  checkin: { type : Number, default: 0 },
  date: { type : String, default: '' },
  uid: { type : String, default: '' },
},
{
  collection: 'userStats'
});

module.exports = mongoose.model('userStats', userStatsSchema);

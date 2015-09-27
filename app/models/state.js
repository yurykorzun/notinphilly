var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StateSchema = new Schema({
   _id: Number,
   name: String,
   abbrev: String
});

module.exports = mongoose.model('State', StateSchema);

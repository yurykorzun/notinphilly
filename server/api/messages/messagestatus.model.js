var mongoose      = require('mongoose');
var timestamps    = require('mongoose-timestamp');
var Schema        = mongoose.Schema;

var MessageStatus = new Schema({
    _id: Number,
    name: String
},
{ collection: 'messageStatus' });

module.exports = mongoose.model('MessageStatus', MessageStatus);

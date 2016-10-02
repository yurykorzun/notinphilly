var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RequestStatus = new Schema({
    _id: Number,
    name: String
},
{ collection: 'requestStatuses' });

module.exports = mongoose.model('RequestStatus', RequestStatus);

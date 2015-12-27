var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreetZipSchema = new Schema({
  zipCode: String
},
{ collection: 'streetNames' });

module.exports = mongoose.model('StreetZipcodes', StreetZipSchema);

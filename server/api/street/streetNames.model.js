var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreetNameSchema = new Schema({
  name: String
},
{ collection: 'streetNames' });

module.exports = mongoose.model('StreetNames', StreetNameSchema);

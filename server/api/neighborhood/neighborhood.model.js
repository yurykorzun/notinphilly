var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NeighborhoodSchema = new Schema({
  name: String,
  code: String,
  description: String,
  geodata:{}
},
{ collection: 'neighborhoods' });

module.exports = mongoose.model('Neighborhood', NeighborhoodSchema);

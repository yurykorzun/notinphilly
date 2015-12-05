var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NeighborhoodSchema = new Schema({
  name: String,
  code: String,
  description: String,
  active: {  type: Boolean, default: false },
  totalStreets: {  type: Number, default: 0 },
  totalAdoptedStreets: {  type: Number, default: 0 },
  percentageAdoptedStreets: {  type: Number, default: 0 },
  geodata:{}
},
{ collection: 'neighborhoods' });

module.exports = mongoose.model('Neighborhood', NeighborhoodSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NeighborhoodSchema = new Schema({
  name: { type: String, default: '', required: [true, 'Neighborhood name is requred'] },
  description: String,
  cityId: {  
    type: Schema.Types.ObjectId,
    ref: 'City'
  },
  active: {  type: Boolean, default: false },
  totalStreets: {  type: Number, default: 0 },
  totalAdoptedStreets: {  type: Number, default: 0 },
  percentageAdoptedStreets: {  type: Number, default: 0 },
  geometry: {}
},
{ collection: 'neighborhoods' });

module.exports = mongoose.model('Neighborhood', NeighborhoodSchema);

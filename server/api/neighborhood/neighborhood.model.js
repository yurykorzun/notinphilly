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
  receivesSupplies: { type: Boolean, default: false },
  geometry: {}
},
{ collection: 'neighborhoods' });

NeighborhoodSchema.virtual('id').get(function() {
  return this._id.toString();
});

NeighborhoodSchema.set('toObject', { virtuals: true });
NeighborhoodSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Neighborhood', NeighborhoodSchema);

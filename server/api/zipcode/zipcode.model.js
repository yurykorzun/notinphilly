var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ZipCodeSchema = new Schema({
  name: { type: String, default: '', required: [true, 'City name is requred'] },
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
{ collection: 'zipcodes' });

ZipCodeSchema.virtual('id').get(function() {
  return this._id.toString();
});

ZipCodeSchema.set('toObject', { virtuals: true });
ZipCodeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ZipCode', ZipCodeSchema);

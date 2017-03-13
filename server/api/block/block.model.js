var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockSchema = new Schema({
  name: { type: String, default: '', required: [true, 'Block name is requred'] },
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
{ collection: 'blocks' });

BlockSchema.virtual('id').get(function() {
  return this._id.toString();
});

BlockSchema.set('toObject', { virtuals: true });
BlockSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blocks', BlockSchema);

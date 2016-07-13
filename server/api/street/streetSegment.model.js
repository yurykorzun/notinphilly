var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreetSchema = new Schema({
  streetName: String,
  neighborhood:{
    type: Schema.Types.ObjectId,
    ref: 'Neighborhood'
  },
  type: String,
  length: Number,
  zipLeft: Number,
  zipRight: Number,
  code: Number,
  block: String,
  leftHundred: Number,
  rightHundred: Number,
  segmentId: Number,
  oneWay: String,
  class: Number,
  totalAdopters: { type : Number, default: 0 },
  isAdopted: { type : Boolean, default: false },
  active: { type : Boolean, default: false },
  geodata:{}
},
{ collection: 'streetSegments' });

module.exports = mongoose.model('StreetSegment', StreetSchema);

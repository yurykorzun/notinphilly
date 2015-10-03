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
  leftHundred: Number,
  rightHundred: Number,
  segmentId: Number,
  oneWay: String,
  class: Number,
  geodata:{}
},
{ collection: 'streetSegments' });

module.exports = mongoose.model('StreetSegment', StreetSchema);

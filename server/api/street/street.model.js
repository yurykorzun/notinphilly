var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreetSchema = new Schema({
  name: { type: String, default: '', required: [true, 'Street name is requred'] },
  neighborhood:{
    type: Schema.Types.ObjectId,
    ref: 'Neighborhood'
  },
  zipCode:{
    type: Schema.Types.ObjectId,
    ref: 'ZipCode'
  },
  totalAdopters: { type : Number, default: 0 },
  isAdopted: { type : Boolean, default: false },
  active: { type : Boolean, default: false },
  geometry:{}
},
{ collection: 'streets' });

module.exports = mongoose.model('Street', StreetSchema);

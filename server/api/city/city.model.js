var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CitySchema = new Schema({
  name: { type: String, default: '', required: [true, 'City name is requred'] },
  country:  { type: String, default: '', required: [true, 'Country is requred'] },
  state:  {  
    type: Number,
    ref: 'State',
    required: [true, 'State is requred']
  },   
  geometry: {}
},
{ collection: 'city' });

module.exports = mongoose.model('City', CitySchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StreetSchema = new Schema({
  name: { type: String, default: '', required: [true, 'Street name is requred'] },
  neighborhoods: [{
    type: Schema.Types.ObjectId,
    ref: 'Neighborhood'
  }],
  zipCodes:[{
    type: Schema.Types.ObjectId,
    ref: 'ZipCode'
  }],
  totalAdopters: { type : Number, default: 0 },
  active: { type : Boolean, default: false },
  isAdoptedByUser: { type : Boolean, default: false },
  totalOtherAdopters: { type : Number, default: 0 },  
  geometry:{}
},
{ collection: 'streets' });

StreetSchema
    .virtual('isAdopted')
    .get(function() {
        var isAdopted = this.totalAdopters > 0;
        return isAdopted;
    });

StreetSchema.virtual('id').get(function() {
  return this._id.toString();
});

StreetSchema.set('toObject', { virtuals: true });
StreetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Street', StreetSchema);

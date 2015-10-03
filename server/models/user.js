var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define our user schema
var userSchema = new Schema({
  firstName: { type : String, default: '' },
  middleName: { type : String, default: '' },
  lastName: { type : String, default: '' },
  birthDate: { type : Date, default: '' },
  phoneNumber: { type : String, default: '' },
  email: { type : String, default: '' },
  role: {
    type: Number,
    ref: 'Role'
  },
  businesName: { type : String, default: '' },
  addressLine1: { type : String, default: '' },
  addressLine2: { type : String, default: '' },
  city: { type : String, default: '' },
  state: {
    type: Number,
    ref: 'State'
  },
  zip: { type : String, default: '' },
  username: { type: String, default: '' },
  password: { type : String, default: '' },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },
  facebook: {},
  twitter: {},
  google: {},
  createDate: { type : Date, default: Date.now }
});

// define our user model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', userSchema);

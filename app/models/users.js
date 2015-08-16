var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define our user schema
var userSchema = new Schema({
  name: { type : String, default: '' },
  email: { type : String, default: '' },
  password: { type : String, default: '' },
  address: { type : String, default: '' },
  date: { type : Date, default: Date.now }
});

// define our user model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', userSchema);

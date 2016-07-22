var mongoose = require('mongoose');
var crypto   = require('bcrypt-nodejs');
var uuid = require('uuid');
var Schema = mongoose.Schema;

// define our user schema
var userSchema = new Schema({
  firstName: { type : String, default: '' },
  middleName: { type : String, default: '' },
  lastName: { type : String, default: '' },
  birthDate: { type : Date, default: '' },
  phoneNumber: { type : String, default: '' },
  businessName: { type : String, default: '' },
  addressName: { type : String, default: '' },
  apartmentNumber: { type : String, default: '' },
  zip: { type : String, default: '' },
  city: { type : String, default: '' },
  isDistributer: {  type: Boolean, default: false },
  state: {
    type: Number,
    ref: 'State'
  },
  email: { type : String, default: '' },
  roles: [{
    type: Number,
    ref: 'Role'
  }],
  hashedPassword: { type: String, default: '' },
  activationHash: String,
  salt: { type: String, default: '' },
  active: {  type: Boolean, default: false },
  authToken: { type: String, default: '' },
  facebook: {},
  twitter: {},
  google: {},
  adoptedStreets: [{
    type: Schema.Types.ObjectId,
    ref: 'StreetSegment'}],
  createDate: { type : Date, default: Date.now }
},
{
  collection: 'userProfiles'
});

userSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);

        //also store an activation hash and remove any "/", so we can pass it as parameter into URL for activation
        this.activationHash = uuid.v4();
        console.log("activationHash " + this.activationHash);
    })
    .get(function() {
        return this._password;
    });

userSchema
    .virtual('userInfo')
    .get(function () {
      return {
        '_id': this._id,
        'fullname': this.firstName + ' ' + this.lastName,
        'email': this.email,
        'roles': this.roles,
        'isAdmin': this.roles.indexOf(1) > -1
      };
    });

userSchema
    .virtual('address')
    .get(function () {
      return this.addressName + " " + this.apartmentNumber;
    });

userSchema
    .virtual('isAdmin')
    .get(function () {
      return this.roles.indexOf(1) > -1;
    });

/*userSchema.path('email').validate(function(value, respond) {
    mongoose.models["User"].findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) return respond(false);
      respond(true);
    });
  }, 'The specified email is already in use.');*/


userSchema
  .virtual('token')
  .get(function() {
      return {
          '_id': this._id,
          'role': this.role
      };
  });

userSchema.set('toObject', {  virtuals: true });
userSchema.set('toJSON', {  virtuals: true });

userSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     */
    makeSalt: function() {
        return crypto.genSaltSync(10);
    },

    /**
     * Encrypt password
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        return crypto.hashSync(password, this.salt);
    }
};

// define our user model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', userSchema);

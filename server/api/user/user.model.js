var mongoose = require('mongoose');
var crypto   = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

// define our user schema
var userSchema = new Schema({
  firstName: { type : String, default: '' },
  middleName: { type : String, default: '' },
  lastName: { type : String, default: '' },
  birthDate: { type : Date, default: '' },
  phoneNumber: { type : String, default: '' },
  businesName: { type : String, default: '' },
  addressLine1: { type : String, default: '' },
  addressLine2: { type : String, default: '' },
  city: { type : String, default: '' },
  state: {
    type: Number,
    ref: 'State'
  },
  email: { type : String, default: '' },
  roles: [{
    type: Number,
    ref: 'Role'
  }],
  zip: { type : String, default: '' },
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

        //also store an activation hash
        this.activationHash = this.encryptPassword(new Date().getTime().toString());
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
        'roles': this.roles
      };
    });

userSchema.path('email').validate(function(value, respond) {
    mongoose.models["User"].findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) return respond(false);
      respond(true);
    });
  }, 'The specified email is already in use.');


userSchema
  .virtual('token')
  .get(function() {
      return {
          '_id': this._id,
          'role': this.role
      };
  });

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

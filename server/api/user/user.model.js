var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var crypto = require('bcrypt-nodejs');
var uuid = require('uuid');
var StateModel = require('../state/state.model');
var Schema = mongoose.Schema;

/*
 * Account Sign Up Steps
 * 1 - Registered
 * 2 - Profile information populated
 * 3 - Block chosen
 * 4 - Fully on-boarded
 */

// define our user schema
var userSchema = new Schema({
    firstName: { type: String, default: '', required: [false, 'First name is required'] },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '', required: [false, 'Last name is required'] },
    birthDate: { type: Date, default: '' },
    phoneNumber: { type: String, default: '' },
    signUpStep: { type: Number },
    businessName: { type: String, default: '' },
    fullAddress: { type: String, default: '' },
    addressLocation: {},
    apartmentNumber: { type: String, default: '' },
    zip: { type: String, default: '' },
    city: { type: String, default: '' },
    isDistributer: { type: Boolean, default: false },
    grabberRequested: { type: Boolean, default: false },
    grabberDelivered: { type: Boolean, default: false },
    state: {
        type: Number,
        ref: 'State'
    },
    email: { type: String, default: '', required: [true, 'Email is required'] },
    roles: [{
        type: Number,
        ref: 'Role'
    }],
    streetNumber: { type: String, default: '' },
    streetName: { type: String, default: '' },
    adoptedStreets: [{
        type: Schema.Types.ObjectId,
        ref: 'Street'
    }],
    neighborhood: {
        type: Schema.Types.ObjectId,
        ref: 'Neighborhood'
    },
    hashedPassword: { type: String, default: '' },
    activationHash: String,
    salt: { type: String, default: '' },
    active: { type: Boolean, default: false },
    hasAgreedToTerms: { type: Boolean, default: false },    
    authToken: { type: String, default: '' },
    facebook: {},
    twitter: {},
    google: {},
    profileImageUrl: { type: String },
    needsCompletion: { type: Boolean }
}, {
    collection: 'userProfiles'
});

userSchema.plugin(timestamps);

userSchema.virtual('id').get(function() {
  return this._id.toString();
});

userSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
        //also store an activation hash and remove any "/", so we can pass it as parameter into URL for activation
        this.activationHash = uuid.v4();
    })
    .get(function() {
        return this._password;
    });


userSchema
    .virtual('userInfo')
    .get(function() {
        var userInfo = {
            '_id': this._id,
            'fullname': this.firstName + ' ' + this.lastName,
            'email': this.email,
            'roles': this.roles,
            'isAdmin': this.roles.length > 0 && this.roles.indexOf(1) > -1
        };
        return userInfo;
    });

userSchema
    .virtual('fullName')
    .get(function() {
        return (this.firstName ? this.firstName + " " : "") + (this.lastName ? this.lastName : "");
    });

userSchema
    .virtual('address')
    .get(function() {
        return (
            (this.streetNumber ? this.streetNumber + " " : "") +
            (this.streetName ? this.streetName + ", " : "") +
            (this.city ? this.city + " " : "") +
            (this.state ? this.state.abbrev + " " : "") +
            (this.zip ? this.zip + " " : "") +
            (this.apartmentNumber ? this.apartmentNumber : "")
        );
    });

userSchema
    .virtual('isAdmin')
    .get(function() {
        return this.roles.length > 0 && this.roles.indexOf(1) > -1;
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
            'roles': this.roles
        };
    });

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     */
    authenticate: function(plainText) {
        var encryptPassword = this.encryptPassword(plainText);
        return encryptPassword === this.hashedPassword;
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
    },

    isAdoptedStreet: function(streetId) {
        if (!this.adoptedStreets) return false;

        for (var i= 0; i < this.adoptedStreets.length; i++)
        {
            var adoptedStreet = this.adoptedStreets[i];
            if (adoptedStreet.id.toString() === streetId.toString())
            {
                return true;
            }
        }
        return false;
    }
};

// define our user model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', userSchema);
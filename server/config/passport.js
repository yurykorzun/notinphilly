var passport      = require('passport');
var crypto        = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var UserModel     = require('../api/user/user.model');

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password' // this is the virtual field on the model
    },
    function(username, password, done) {
        console.log('Authenticating user ' + username);
        UserModel.findOne({
            username: username.toLowerCase()
        }, function(err, user) {
            if (err) {
              console.log(err);
              return done(err);
            };

            if (!user) {
                return done(null, false, {
                    message: 'This username is not registered.'
                });
            }
            if (!user.authenticate(password)) {
                return done(null, false, {
                    message: 'This password is not correct.'
                });
            }

            console.log('Checking if user is activated');
            if (!user.active) {
                return done(null, false, {
                    message: 'Your account is not activated.  Check your email for an activation link.'
                });
            }

            return done(null, user);
        });
    }
));

// Passport needs to be able to serialize and deserialize users to support persistent login sessions
passport.serializeUser(function(user, done) {
    console.log("serialize user" + user._id);
    done(null, user.userInfo);
});

passport.deserializeUser(function(user, done) {
    console.log("deserialize user" + user._id);
    UserModel.findById(user._id, function(err, user) {
        done(err, user.userInfo);
    });
});

// Generates hash using bCrypt
var createHash = function(password){
    return crypto.hashSync(password, crypto.genSaltSync(10), null);
};

var login = require('./login');
var signup = require('./signup');
var User = require('../../api/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
        User.findOne({
            email: email.toLowerCase()
        }, function(err, user) {
            if (err) return done(err);

            if (!user) {
                return done(null, false, {
                    message: 'This email is not registered.'
                });
            }
            if (!user.authenticate(password)) {
                return done(null, false, {
                    message: 'This password is not correct.'
                });
            }

            console.log('Checking if user is activated');
            if (!user.activated) {
                return done(null, false, {
                    message: 'Your account is not activated.  Check your email for an activation link.'
                });
            }

            return done(null, user);
        });
    }
));

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log('deserializing user:',user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);

};

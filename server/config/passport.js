var passport = require('passport');
var crypto = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var flash = require('connect-flash');
var serverSettings = require('./serverSettings');
var UserModel = require('../api/user/user.model');
var userService = require('../service/userService');

module.exports = function(app) {
    console.log("init passport");

    app.use(passport.initialize());
    app.use(flash());
    app.use(passport.session());

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        done(null, user.userInfo);
    });

    passport.deserializeUser(function(user, done) {
        UserModel.findById(user._id, function(err, user) {
            if (err || !user) {
                done(err, false, {
                    message: 'Your account is not found.'
                });
            } else {
                done(null, user.userInfo);
            }
        });
    });

    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password' // this is the virtual field on the model
        },
        function(email, password, done) {
            UserModel.findOne({
                email: email.toLowerCase()
            }, function(err, user) {
                if (err) {
                    return done(err);
                } else if (!user) {
                    return done(null, false, {
                        message: 'This user is not registered.'
                    });
                } else if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'This password is not correct.'
                    });
                } else if (!user.active) {
                    return done(null, false, {
                        message: 'Your account is not activated.  Check your email for an activation link.'
                    });
                }

                return done(null, user);
            });
        }
    ));

    passport.use(new FacebookStrategy({
        clientID: serverSettings.FACEBOOK_APP_ID,
        clientSecret: serverSettings.FACEBOOK_SECRET,
        callbackURL: serverSettings.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'first_name', 'last_name', 'photos', 'emails']
    }, function(accessToken, refreshToken, profile, done) {
        if (!profile) return done("Facebook login failed");

        var fbid = profile.id;
        var email = profile.emails.length > 0 ? profile.emails[0].value : undefined;

        if (email)
        {
            userService.getUserByEmail(email).then(
                function(foundUser) {
                    if (foundUser) {
                        foundUser.profileImageUrl = profile.photos.length > 0 ? profile.photos[0].value : undefined;
                        foundUser.facebook = {
                                                id: profile.id,
                                                accessToken: accessToken
                                            };
                        foundUser.needsCompletion = false;

                        userService.update(foundUser).then(function(updatedUser) {
                            done(null, updatedUser);
                        },
                        function(error)
                        {
                            done(error);
                        })
                    }
                    else
                    {
                        createFacebookUser(fbid, email, profile, accessToken, done);
                    }
                },
                function(error) {
                    done(error);
                }
            );
        }
        else
        {
            createFacebookUser(fbid, email, profile, accessToken, done);
        }

       
    
    }));

    var createFacebookUser = function(fbid, email, profile, accessToken, done) {
        userService.getUserByFacebookId(fbid).then(
                    function(result) {
                        if (result) return done(null, result);
                        else {
                            var newFacebookUser = {
                                firstName: profile.name.givenName,
                                lastName: profile.name.familyName,
                                facebook: {
                                    id: profile.id,
                                    accessToken: accessToken
                                },
                                email: email,
                                profileImageUrl: profile.photos.length > 0 ? profile.photos[0].value : undefined,
                                needsCompletion: true
                            }
                            userService.createSocial(newFacebookUser).then(
                                function(result) {
                                    done(null, result);
                                },
                                function(error) {
                                    done(error);
                                }
                            );
                        }
                    },
                    function(error) {
                        return done(error);
                    }
            )
    }

    // Generates hash using bCrypt
    var createHash = function(password) {
        return crypto.hashSync(password, crypto.genSaltSync(10), null);
    };
}
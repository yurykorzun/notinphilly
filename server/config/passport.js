var passport        = require('passport');
var crypto          = require('bcrypt-nodejs');
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var flash           = require('connect-flash');
var serverSettings  = require('./serverSettings');
var apiSettings  = require('./apiSettings');
var UserModel       = require('../api/user/user.model');
var userService     = require('../service/userService');
var logger          = require('../components/logger');

module.exports = function(app) {
    logger.debug("init passport");

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
                email: email
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
        clientID: apiSettings.FACEBOOK_APP_ID,
        clientSecret: apiSettings.FACEBOOK_SECRET,
        callbackURL: apiSettings.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'first_name', 'last_name', 'photos', 'emails']
    }, 
    function(accessToken, refreshToken, profile, done) {
        if (!profile) return done("Facebook login failed");

        var fbid = profile.id;
        var email = getUserEmail(profile);

        if (email)
        {
            userService.getUserByEmail(email).then(
                function(foundUser) {
                    if (foundUser) {

                        foundUser = updateFacebookUser(foundUser, profile, accessToken);
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
                        createFacebookUser(fbid, email, profile, accessToken)
                            .then(function(result) {
                                done(null, result);
                            },
                            function(error) {
                                done(error);
                            });
                    }
                },
                function(error) {
                    done(error);
                }
            );
        }
        else
        {
            createFacebookUser(fbid, email, profile, accessToken)
                            .then(function(result) {
                                done(null, result);
                            },
                            function(error) {
                                done(error);
                            });
        }

       
    
    }));

    var updateFacebookUser = function(user, profile, accessToken) {
        user.profileImageUrl = getUserPhotoUrl(profile);
        user.facebook = {
                                id: profile.id,
                                accessToken: accessToken
                            };
        user.needsCompletion = false;

        return user;
    }

    var createFacebookUser = function(fbid, email, profile, accessToken) {
        return new Promise(function (fulfill, reject){
            userService.getUserByFacebookId(fbid).then(
                        function(result) {
                            if (result) fulfill(result);
                            else {
                                var newFacebookUser = {
                                    firstName: profile.name.givenName,
                                    lastName: profile.name.familyName,
                                    facebook: {
                                        id: profile.id,
                                        accessToken: accessToken
                                    },
                                    email: email,
                                    profileImageUrl: getUserPhotoUrl(profile),
                                    needsCompletion: true
                                }
                                userService.createSocial(newFacebookUser).then(
                                    function(result) {
                                        fulfill(result);
                                    },
                                    function(error) {
                                        reject(error);
                                    }
                                );
                            }
                        },
                        function(error) {
                            reject(error);
                        }
                )
        });
    }

    var getUserPhotoUrl = function(profile) {
        return profile.photos.length > 0 ? profile.photos[0].value : undefined;
    }

     var getUserEmail = function(profile) {
        return profile.emails.length > 0 ? profile.emails[0].value : undefined;
    }

    // Generates hash using bCrypt
    var createHash = function(password) {
        return crypto.hashSync(password, crypto.genSaltSync(10), null);
    };
}
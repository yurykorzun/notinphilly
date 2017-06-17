var mongoose            = require('mongoose');
var promise             = require('promise');
var lodash              = require('lodash');
var uuid                = require('uuid');
var passwordGenerator   = require('generate-password');
var emailService        = require('./emailService');
var streetService       = require('./streetService');
var neighborhoodService = require('./neighborhoodService');
var UserModel           = require('../api/user/user.model');
var StateModel          = require('../api/state/state.model');
var logger              = require('../components/logger');

exports.getUserById = function(userId, populate) {
    return new Promise(function(fulfill, reject) {
        if (!userId) {
            logger.error("userService.getUserById User id is missing");
            reject("User id is missing");
        }
        else {
            var query = UserModel.findById(userId);
            if (populate)
            {
                query = query.populate('state').populate('adoptedStreets');
            }
            
            query
            .select('-salt -hashedPassword -_v -authToken -__v')
            .exec(function(err, user) {
                if (err) {
                    logger.error("userService.getUserById " + err);
                    reject(err);
                } 
                else if (!user) reject("User doesn't exist");
                else fulfill(user);
            });
        }
    });
}


exports.getUserByFacebookId = function(facebookId) {
    return new Promise(function(fulfill, reject) {
        if (!facebookId) {
            logger.error("userService.getUserByFacebookId Facebook id is missing");
            reject("Facebook id is missing");
        } 
        else {
            UserModel.findOne({
                    "facebook.id": facebookId
                },
                function(err, user) {
                    if (err) 
                    { 
                        logger.error("userService.getUserByFacebookId " + err);
                        reject("User retrieval by facebook id failed " + err);
                    }
                    else fulfill(user);
                });
        }
    });
}

exports.getUserByEmail = function(email) {
    return new Promise(function(fulfill, reject) {
        if (!email) {
            logger.error("userService.getUserByEmail email is missing");
            reject("email is missing");
        } 
        else {
            UserModel.findOne({
                    "email": email
                },
                function(err, user) {
                    if (err) {
                        logger.error("userService.getUserByEmail " + err);
                        reject("User retrieval by email failed " + err);
                    } 
                    else fulfill(user);
                });
        }
    });
}

exports.getAll = function() {
    return new Promise(function(fulfill, reject) {
        UserModel.find({})
            .populate('state')
            .populate('adoptedStreets')
            .select('-salt -hashedPassword -_v -authToken -__v')
            .exec(function(err, users) {
                if (err) {
                    logger.error("userService.getAll " + err);
                    reject(err);
                } 
                else fulfill(users);
            });
    });
}

exports.getAllSorted = function(sortDirection, sortColumn) {
    return exports.getAllPagedSorted(sortColumn, sortDirection, undefined, undefined);
}

exports.getAllPagedSorted = function(sortColumn, sortDirection, skip, limit) {
    return new Promise(function(fulfill, reject) {
        UserModel.count({}, function(err, count) {
            var query = UserModel.find({});

            if (skip) query = query.skip(skip);
            if (limit) query = query.limit(limit);

            var query = query.skip(skip).limit(limit)
                .populate('state')
                .populate('adoptedStreets')   
                .populate('neighborhood')           
                .select('-salt -hashedPassword -_v -authToken -__v');

            if (sortColumn && sortDirection) {
                if (sortColumn == "address") query = query.sort({
                    streetNumber: sortDirection,
                    streetName: sortDirection,
                    city: sortDirection,
                    state: sortDirection,
                    zip: sortDirection,
                    apartmentNumber: sortDirection
                });
                else query = query.sort([
                    [sortColumn, sortDirection === 'asc' ? 1 : -1]
                ]);
            }

            query.exec(function(err, users) {
                if (err) {
                    logger.error("userService.getAllPagedSorted " + err);
                    reject(err);
                } 

                var data = { users: users, count: count };
                fulfill(data);
            });
        });
    });
}

exports.create = function(user, isActiveUser, isEmailRequired) {
    return new Promise(function(fulfill, reject) {
        UserModel.findOne({ email: user.email }, function(err, existingUser) {
            if (err){
                logger.error("userService.create " + err);
                reject(err);
            }
            else if (existingUser) reject("user " + existingUser.email + " already exists");
            else {
                if (!user.password) reject("Please enter password and confirm your password");
                if (user.password !== user.passwordConfirm) reject("Your passwords do not match");
                else {
                    var newUser = createNewUser(user, isActiveUser);
                            
                            validateUserAndSave(newUser).then(function(savedUser){
                                if (isEmailRequired) {
                                    emailService.sendUserConfirmationEmail(savedUser.email, savedUser.firstName, savedUser.lastName, savedUser.activationHash);
                                }

                                emailService.sendUserWelcomeEmail(savedUser.email, savedUser.firstName, savedUser.lastName);                                            
                                emailService.sendUserNotificationEmail(savedUser.firstName, savedUser.lastName, savedUser.email, savedUser.fullAddress);

                                fulfill(savedUser);
                            },
                            function(error){
                                logger.error("userService.create " + error);
                                reject(error);
                            });
                }
            }
        })
    });
};

exports.createSocial = function(user) {
    return new Promise(function(fulfill, reject) {
        UserModel.findOne({ email: user.email }, function(err, existingUser) {
            if (err) {
                logger.error("userService.createSocial " + err);
                reject(err);
            } 
            else if (existingUser) reject("user " + existingUser.email + " already exists");
            else {
                if (!user.facebook) reject("Facebook profile is missing");

                var User = mongoose.model('User');
                var newUser = new User(user);
                newUser.active = true;
                newUser.roles = [4];
                newUser.adoptedStreets = [];

                validateUserAndSave(newUser).then(function(savedUser){
                    emailService.sendUserWelcomeEmail(savedUser.email, savedUser.firstName, savedUser.lastName);                                            
                    emailService.sendUserNotificationEmail(savedUser.firstName, savedUser.lastName, savedUser.email, savedUser.fullAddress);
                                
                    fulfill(savedUser);
                },
                function(error){
                    logger.error("userService.create " + error);
                    reject(error);
                });
            }
        });
    });
}

exports.update = function(user) {
    var updatedUser = user;

    return new Promise(function(fulfill, reject) {
        if (!updatedUser || !updatedUser._id) reject("User is missing. Update failed.");

        UserModel.findById(updatedUser._id, function(err, existingUser) {
            if (err) {
                logger.error("userService.update " + err);
                reject(err);
            } 
            else {
                existingUser.merge(updatedUser);

                if(existingUser.addressLocation)
                {
                     neighborhoodService.getByLocation(existingUser.addressLocation.lat, existingUser.addressLocation.lng).then(
                        function(neighborhood)
                        {
                            existingUser.neighborhood = neighborhood ? neighborhood._id : undefined;
                            
                             validateUserAndSave(existingUser).then(function(savedUser){      
                                                        fulfill(savedUser);
                                                    },
                                                    function(error){
                                                        logger.error("userService.update " + error);
                                                        reject(error);
                                                    });
                        });
                }
                else
                {
                     validateUserAndSave(existingUser).then(function(savedUser){      
                                                        fulfill(savedUser);
                                                    },
                                                    function(error){
                                                        logger.error("userService.update " + error);
                                                        reject(error);
                                                    });
                }
            }
        });
    });
};

exports.delete = function(userId) {
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("User is missing. User deletion failed.");
        else {
            UserModel.findById(userId).exec(function(err, user) {
                if (err) {
                    logger.error("userService.delete " + err);
                    reject("User retrieval failed " + err);
                } 
                else {
                    var userId = user._id;
                    streetService.decrementAdopters(user.adoptedStreets).then(
                        function(result) {
                            UserModel.remove({ _id: userId }, function(err, result) {
                                if (err) {
                                    logger.error("userService.delete " + err);
                                    reject("User removal failed " + err);
                                } 
                                else {
                                    fulfill(userId);
                                }
                            });
                        },
                        function(error) {
                            logger.error("userService.delete " + error);
                            reject("User retrieval failed " + err)
                        }
                    );
                }
            });
        }

    });
};

exports.changePassword = function(userId, oldPassword, newPassword) {
    return new Promise(function(fulfill, reject) {
        UserModel.findById(userId, function(err, existingUser) {
            if (err) {
                logger.error("userService.changePassword " + err);
                reject(err);
            }
            else if (existingUser.authenticate(oldPassword)) {
                existingUser.activationHash = uuid.v4();
                existingUser.password = newPassword;

                existingUser.save(function(err, updatedUser) {
                    if (err) {
                        logger.error("userService.changePassword " + err);
                        reject(err);
                    }
                    else fulfill(updatedUser);
                });
            } else {
                reject("Authentication for a user failed");
            }
        });
    });
};

exports.resetPassword = function(userEmail) {
    return new Promise(function(fulfill, reject) {
        if (!userEmail) reject("user email is missing");

        UserModel.findOne({ email: userEmail }, function(err, existingUser) {
            if (err) {
                logger.error("userService.resetPassword " + err);
                reject(err);
            } 
            else if (!existingUser) fulfill();
            else {
                var newPassword = passwordGenerator.generate({
                    length: 10,
                    numbers: true
                });

                existingUser.activationHash = uuid.v4();
                existingUser.password = newPassword;

                existingUser.save(function(err, updatedUser) {
                    if (err) {
                        logger.error("userService.resetPassword " + err);
                        reject(err);
                    } 
                    else {
                        emailService.sendResetPasswordEmail(updatedUser.firstName, updatedUser.lastName, updatedUser.email, newPassword);
                        fulfill(updatedUser);
                    }
                });
            }
        });
    });
}

exports.activate = function(activationId) {
    return new Promise(function(fulfill, reject) {
        UserModel.findOne({ activationHash: activationId }, function(err, existingUser) {
            if (err) {
                logger.error("userService.activate " + err);
                reject("User retrieval failed " + err);
            } 
            else if (!existingUser) reject("User doesn't exist ");
            else {
                if (existingUser.active) fulfill(existingUser);

                existingUser.active = true;
                existingUser.save(function(err, activedUser) {
                    if (err) {
                        logger.error("userService.activate " + err);
                        reject("User saving failed " + err);
                    } 
                    else fulfill(activedUser);
                })
            }
        });
    });
}

var createNewUser = function(userData, isActiveUser, stateId, neighborhoodId)
{
      var User = mongoose.model('User');
      var newUser = new User({
                                firstName: userData.firstName,
                                middleName: userData.middleName,
                                lastName: userData.lastName,
                                birthDate: userData.birthDate,
                                phoneNumber: userData.phoneNumber,
                                signUpStep: 1,
                                email: userData.email.toLowerCase(),
                                businessName: userData.businessName,
                                fullAddress: userData.fullAddress,
                                addressLocation: userData.addressLocation,
                                apartmentNumber: userData.apartmentNumber,
                                active: isActiveUser,
                                hasAgreedToTerms: userData.hasAgreedToTerms,
                                roles: [4],
                                city: userData.city,
                                state: stateId,
                                zip: userData.zip,
                                streetNumber: userData.streetNumber,
                                streetName: userData.streetName,
                                password: userData.password,
                                isDistributer: userData.distributer,
                                adoptedStreets: [],
                                neighborhood: neighborhoodId
                            });
    
    return newUser;
}

var validateUserAndSave = function(user)
{
    return new Promise(function(fulfill, reject) {
          user.validate(function(validationError) {
                if (validationError) {
                    var messages = parseErrorMessage(validationError);
                    reject(messages);
                } else {
                    user.save(function(err, savedUser) {
                        if (err) {
                            logger.error("userService.validateUserAndSave " + err);
                            reject(err);
                        } 
                        else {
                            fulfill(savedUser);
                        }
                    });
                }
            });
        });
}

var parseErrorMessage = function(validationError) {
    if (validationError) {
        if (validationError.errors) {
            var errors = validationError.errors;
            var errorKeys = Object.keys(errors);
            var messages = [];
            for (var i = 0; i < errorKeys.length; i++) {
                var field = errorKeys[i];
                var message = errors[field].message;

                messages.push(message);
            }

            return messages;
        } else {
            return "user validation failed";
        }
    }

    return undefined;
}

var findStateForString = function(sateCode) {
    return new Promise(function(fulfill, reject) {
        StateModel.findOne({ abbrev: new RegExp('^' + sateCode + '$', "i") }, function(err, foundState) {
            if (err) {
                logger.error("findStateForString " + err);
                reject(err);
            } 

            if (foundState) fulfill(foundState);
            else reject("State " + sateCode + " wasn't found");
        });
    });
}
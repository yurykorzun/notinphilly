var mongoose      = require('mongoose');
var uuid          = require('uuid');
var UserModel     = require('./user.model');
var StateModel    = require('../state/state.model');
var StreetModel   = require('../street/streetSegment.model');
var NeighborhoodModel       = require('../neighborhood/neighborhood.model');
var toolRequestController   = require('../toolRequests/toolRequest.controller');
var apiSettings           = require('../../config/apiSettings');
var mailgun               = require('mailgun-js')({apiKey: apiSettings.EMAIL_API_KEY, domain: apiSettings.EMAIL_DOMAIN});

exports.index = function(req, res) {
  UserModel.find({})
          .populate('state')
          .populate('adoptedStreets')
          .select('-salt -hashedPassword -_v -authToken -__v')
          .exec(function (err, users) {
            if (err) return res.status(500).send(err);
            res.status(200).json(users);
          });
};

exports.getAllPaged = function(req, res) {
  var page = req.params.pageNumber;
  var skip = req.params.pageSize;
  var sortColumn = req.params.sortColumn;
  var sortDirection = req.params.sortDirection;

  var itemsToSkip = (page - 1) * skip;

  UserModel.count({}, function( err, count) {
      var query = UserModel.find({})
                  .skip(itemsToSkip).limit(skip)
                  .populate('state')
                  .populate('adoptedStreets')
                  .select('-salt -hashedPassword -_v -authToken -__v');

      if (sortColumn == "address")
      {
        query = query.sort({ streetNumber: sortDirection, streetName: sortDirection, city: sortDirection, state: sortDirection, zip: sortDirection, apartmentNumber: sortDirection});
      }
      else {
        query = query.sort([[sortColumn, sortDirection === 'asc' ? 1 : -1]]);
      }

      query.exec(function(err, users) {
              if (err) return res.status(500).send(err);

              var data = { users: users, count: count};
              res.status(200).json(data);
          });
  });

};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
  var isEmailRequired = req.body.confirmationEmailRequired;

  UserModel.findOne({email: req.body.email}, function(err, user) {
    if(err) throw err;

    if (user) {
      console.log('user already registred ' + user._id);
      res.status(409).send('User with this email alreay has an account');
    }
    else {
      errorMessage = checkForErrors(req.body);
      if (!errorMessage) {

      StateModel.findOne({ abbrev: new RegExp('^'+req.body.stateName+'$', "i") }, function(err, foundState) {
        if(err) throw err;

        if(foundState)
        {
          var User = mongoose.model('User', UserModel);
          var newUser = new User({
              firstName: req.body.firstName,
              middleName: req.body.middleName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              phoneNumber: req.body.phoneNumber,
              email: req.body.email,
              roles: [4],
              businessName: req.body.businessName,
              fullAddress: req.body.fullAddress,
              addressLocation: req.body.addressLocation,
              apartmentNumber: req.body.apartmentNumber,
              active: false,
              city: req.body.city,
              state: foundState._id,
              zip: req.body.zip,
              streetNumber: req.body.streetNumber,
              streetName: req.body.streetName,
              password: req.body.password,
              isDistributer: req.body.distributer,
              grabberRequested: false,
              grabberDelivered: false,
              adoptedStreets: []
          });
          newUser.save(function(err, thor){
               if (err) {
                 console.log(err);
                 res.status(500).send('There was an issue. Please try again later');
               }
               else {
                 if (isEmailRequired)
                 {
                   UserModel.findOne({email: req.body.email}, function(err, user) {
                     sendConfirmationEmail(req, user);
                     res.status(200).send('Successfully Sent Confirmation Email');
                   });
                 }
                 else {
                   res.status(200).send('Successfully added user');
                 }
               }
               console.log('Finished adding the user');
             }
           );
        }
        else {
           res.status(500).send('Invalid state code was provided ' + req.body.stateName);
        }
      });

     }
     else {
       res.status(409).send(errorMessage);
     }
    }
  });
};

exports.update = function(req, res) {
  var userId = req.body._id.toString();
  if(!userId)
  {
    userId = req.user._id;
  }

  // Find user based on ID from request
  UserModel.findById(userId, function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');

    if(req.body.firstName) user.firstName = req.body.firstName;
    if(req.body.lastName) user.lastName = req.body.lastName;
    if(req.body.email) user.email = req.body.email;

    user.phoneNumber = req.body.phoneNumber;
    user.businessName = req.body.businessName;
    user.apartmentNumber = req.body.apartmentNumber;

    if(req.body.city) user.city = req.body.city;
    if(req.body.zip) user.zip = req.body.zip;
    if(req.body.streetNumber) user.streetNumber = req.body.streetNumber;
    if(req.body.streetName) user.streetName = req.body.streetName;
    if(req.body.active != undefined) user.active = req.body.active;
    if(req.body.fullAddress) user.fullAddress = req.body.fullAddress;
    if(req.body.addressLocation) user.addressLocation = req.body.addressLocation;
    if(req.body.roles != undefined) user.roles = req.body.roles;

    if (req.body.grabberRequested != undefined) user.grabberRequested = req.body.grabberRequested;
    if (req.body.grabberDelivered != undefined) user.grabberDelivered = req.body.grabberDelivered;

    user.isDistributer = req.body.isDistributer;

    user.save(function (err, user) {
      if (err)
      {
        console.err(err);
        res.status(500).send('There was an issue. Please try again later');
      }
      // Successfully updated user
      res.status(200).send('Your profile was updated Successfully');
    });
  });
};

exports.changePassword = function(req, res, next) {
  if(req.isAuthenticated() && req.user) {
    var userId = req.user._id;
    if (!userId) return res.status(401).send('Unauthorized');

    var oldPass = req.body.oldPassword;
    var newPass = req.body.newPassword;

    UserModel.findById(userId, function(err, user) {
        if (user.authenticate(oldPass)) {
            user.activationHash = uuid.v4();
            user.password = newPass;
            user.save(function(err) {
                if (err) return next(err);

                res.status(200).send('Successfully changed password');
            });
        } else {
            res.status(403).send('Password change failed');
        }
    });
  }
  else {
    res.status(403).send('Password change is forbidden');
  }
};

var checkForErrors = function(userInfo) {
  if (userInfo.email === '' || typeof userInfo.email === 'undefined'){
    return "Please enter email address";
  }
  if (userInfo.fistName === '' || typeof userInfo.firstName === 'undefined'){
    return "Please enter your First name";
  }
  if (userInfo.email === '' || typeof userInfo.lastName === 'undefined'){
    return "Please enter your last name";
  }
  if (userInfo.password === '' || typeof userInfo.password === 'undefined'){
    return "Please enter password and confirm your password";
  }
  if (userInfo.password !== userInfo.passwordConfirm) {
    return "Your passwords do not match";
  }
  return undefined;
}

/**
 * Send confirmation email
 */

//Use tempaltes instead of TEXT
var sendConfirmationEmail = function(req, user) {
  var data = {
    from: 'noreply <noreply@notinphilly.org>',
    cc: 'notinphilly@gmail.com',
    to: req.body.firstName + " " + req.body.lastName + " " +"<"+ req.body.email +">",
    subject: "NotInPhilly. Confirm registration.",
    text: "Hi " + req.body.firstName + ", \n\n Please follow the link in order to finish the registration: \n http://notinphilly.org/api/users/confirm/" + user.activationHash + "\n \n \n #NotInPhilly Team"
  };

  mailgun.messages().send(data, function (error, body) {
  });
}


/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findById(userId, '-salt -hashedPassword -_v -authToken -__v')
              .populate('state')
              .populate('adoptedStreets')
              .exec(function(err, user) {
                  if (err) return next(err);
                  if (!user) return res.status(401).send('Unauthorized');
                  if (user.active != true) return res.status(401).send('Please activate your user');
                  res.json(user);
              });
};

/**
 * Get a single user
 */
exports.get = function(req, res, next) {
    var userId = req.params.id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findById(userId)
            .populate('state')
            .populate('adoptedStreets')
            .select('-salt -hashedPassword -_v -authToken -__v')
            .exec(function(err, user) {
                if (err) return next(err);
                if (!user) return res.status(401).send('User not found');
                if (user.active === false) return res.status(401).send('Please confirm the user. Check your email.');
                res.json(user);
            });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  var userId = req.params.id;
  if (userId) {
    UserModel.findById(userId).exec(function(err, user) {
        if (err) return next(err);

        if (user.adoptedStreets && user.adoptedStreets.length > 0)
        {
          StreetModel.find({ _id: { $in: user.adoptedStreets }}, function(err, streets) {
            if (err) return next(err);

            for (var streetIndex = 0; streetIndex < streets.length; streetIndex++ )
            {
              var street = streets[streetIndex];
              if (street.totalAdopters)
              {
                street.totalAdopters--;
              }
              else {
                street.totalAdopters = 0;
              }
              street.save(function(err, savedStreet) {
                if (err) {
                  console.log("Error while deleting user " + err);
                  return next(err);
                }

                NeighborhoodModel.findById(savedStreet.neighborhood, function(err, neighborhood) {
                  if (err) res.status(500).json(err);

                  if(neighborhood.totalAdoptedStreets > 0) {
                    neighborhood.totalAdoptedStreets -= 1;
                    neighborhood.percentageAdoptedStreets =  Math.round((neighborhood.totalAdoptedStreets / neighborhood.totalStreets) * 100);
                  }
                  else {
                    neighborhood.percentageAdoptedStreets = 0;
                  }

                  neighborhood.save(function(err, savedNeighborhood){});

                });
              });
            }
          });
        }

        toolRequestController.removeForUser(user._id);

        UserModel.remove({ _id: user._id }, function(err, user) {
          if (err) {
            console.log("Error while deleting user " + err);
            return next(err);

            res.status(500).send('There was an issue. Please try again later');
          }

          res.status(200).send();
        });

        res.json(user);
    });
  }
};

exports.resetPassword = function(req, res) {
    var confirmId = req.params.activationId;
    var password = req.params.password;
    var confirmPassword = req.params.confirmPassword;

    if (password == confirmPassword) {
       UserModel.findOne({activationHash: confirmId}, function(err, user){
           if (err) return next(err);
           if (!user) return res.status(401).send('Could not find the user with activation Tag' + req.param.confirmId);
       });
    } else {

    }
}

exports.activate = function(req, res) {
  var confirmId = req.params.activationId;
  UserModel.findOne({activationHash: confirmId}, function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).send('Could not find the user with activation tag: ' + req.params.confirmId);
      user.active = true;
      user.save(function (err) {
        if (err) {
          console.log("Error while saving user" + err);
        } else {
          res.statusCode = 302;
          res.setHeader("Location", "/confirm.html");
          res.end();
          console.log("Successfully Confirmed user(" + user.id +")");
        }
      })
  });
};

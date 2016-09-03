var mongoose      = require('mongoose');
var UserModel     = require('./user.model');
var StateModel    = require('../state/state.model');
var uuid          = require('uuid');
var settings      = require('../../config/settings');
var mailgun       = require('mailgun-js')({apiKey: settings.serverSettings.EMAIL_API_KEY, domain: settings.serverSettings.EMAIL_DOMAIN});

exports.index = function(req, res) {
  UserModel.find({}, '-salt -hashedPassword -_v -authToken -__v')
          .populate('state')
          .populate('adoptedStreets')
          .exec(function (err, users) {
            if (err) return res.status(500).send(err);
            res.status(200).json(users);
          });
};

exports.getAllPaged = function(req, res) {
  var page = req.params.pageNumber;
  var skip = req.params.pageSize;
  var itemsToSkip = (page - 1) * skip;

  UserModel.count({}, function( err, count) {
      UserModel.find({}, '-salt -hashedPassword -_v -authToken -__v',   {skip:itemsToSkip, limit: skip })
                .populate('state')
                .populate('adoptedStreets')
                .exec(function(err, users) {
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
              adoptedStreets: []
          });
          newUser.save(function(err, thor){
               if (err) {
                 console.log(err);
                 res.status(500).send('There was an issue. Please try again later');
               }
               else {
                 UserModel.findOne({email: req.body.email}, function(err, user) {
                   sendConfirmationEmail(req, user);
                   res.status(200).send('Successfully Sent Confirmation Email');
                 });
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
    if (user.active != true) return res.status(401).send('User is not active');

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
    text: "Hi " + req.body.firstName + ", \n Please follow the link in order to finish the registration: \n http://notinphilly.org/api/users/confirm/" + user.activationHash + "\n \n \n #NotInPhilly Team"
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

    UserModel.findById(userId, '-salt -hashedPassword -_v -authToken -__v')
            .populate('state')
            .populate('adoptedStreets')
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
  // TODO: actually delete the user with this id
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var confirmId = req.params.confirmId;
  UserModel.findOne({activationHash: confirmId}, function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).send('Could not find the user with activation tag: ' + req.params.confirmId);
      user.activationHash = uuid.v4();
      user.password = req.body.password;
      user.save(function (err) {
        if (err) {
          console.log("Error while saving user" + err);
        } else {
          res.statusCode = 302;
          res.setHeader("Location", "/");
          res.end();
          console.log("Password has been changed");
        }
      })
  });
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

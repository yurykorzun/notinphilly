var mongoose = require('mongoose');
var UserModel = require('./user.model');
var mailer = require('../../components/mailer');
var uuid = require('uuid');

exports.index = function(req, res) {
    UserModel.find({}, '-salt -hashedPassword -_v -authToken -__v', function(err, users) {
        if (err) return res.status(500).send(err);
        res.status(200).json(users);
    });
};

exports.getAllPaged = function(req, res) {
  var page = req.params.pageNumber;
  var skip = req.params.pageSize;
  var itemsToSkip = (page - 1) * skip;

  UserModel.count({}, function( err, count){
      UserModel.find({},
                    '-salt -hashedPassword -_v -authToken -__v',
                    {skip:itemsToSkip, limit: skip },
                    function(err, users) {
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

    if(user) {
      console.log('user already registred');
      res.status(409).send('User with this email alreay has an account');
      return "User already exists";
    }

     errorMessage = checkForErrors(req.body);
    if (!errorMessage) {
      UserModel.create(
        {
          firstName: req.body.firstName,
          middleName: req.body.middleName,
          lastName: req.body.lastName,
          birthDate: req.body.birthDate,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          role: [1],
          businessName: req.body.businessName,
          addressName: req.body.addressName,
          apartmentNumber: req.body.aptNumber,
          active: true,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          password: req.body.password,
          isDistributer: req.body.distributer
        }, function(err, thor){
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

    } else {
      res.status(409).send(errorMessage);
    }
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
  var mailOptions = { from: "noreply <noreply@notinphilly.org>",
                      to:  req.body.firstName + " " + req.body.lastName + " " +"<"+ req.body.email +">",
                      subject: "NotInPhilly. Confirm registration.",
                      text: "Hi " + req.body.firstName + ", \n Please follow the link in order to finish the registration: \n http://notinphilly.org/api/users/confirm/" + user.activationHash + "\n \n \n #NotInPhilly Team"
                    };
  //Send confirmation email
  mailer.sendMail(mailOptions);
}

/**
 * Get a single user
 */
exports.get = function(req, res, next) {
    var userId = req.params.id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Incorrect username or password');
        if (user.active === false) return res.status(401).send('Please confirm the user. Check your email.');
        res.json(user);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {

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


/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findOne({_id: userId}, '-salt -hashedPassword -__v', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        if (user.active != true) return res.status(401).send('Please activate your user');
        res.json(user);
    });
};

exports.update = function(req, res) {

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

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

var mongoose = require('mongoose');
var UserModel = require('./user.model');

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
    UserModel.find({}, '-salt -hashedPassword', function(err, users) {
        if (err) return res.status(500).send(err);
        res.status(200).json(users);
    });
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
  mongoose.models["User"].findOne({email: req.body.email}, function(err, user) {
    if(err) throw err;
    if(user) {
      console.log('user already registred');
      res.status(409).send('User with this email alreay has an account');
    } else {
      UserModel.create(
        {
          firstName: req.body.fistName,
          middleName: req.body.middleName,
          lastName: req.body.lastName,
          birthDate: req.body.birthDate,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          role: [1],
          businesName: req.body.businessName,
          addressLine1: req.body.houseNumber + ' ' + req.body.addressLine1 +
          " " + req.body.aptNumber,
          addressLine2: req.body.addressLine2,
          active: true,
          city: req.body.city,
          state: 1,
          zip: req.body.zip,
          password: req.body.password
        }, function(err, thor){
          console.log(err);
          if (err) {
            res.status(500).send('There was an issue. Please try again later');
          };
          res.status(200).send('Successfully Added the user');
          console.log('Finished adding the user');
        }
      )
      res.status(200).send('Successfully Added the user');
      return true;
    }
  });
};

/**
 * Get a single user
 */
exports.get = function(req, res, next) {
    var userId = req.params.id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
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

};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findOne({_id: userId}, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user);
    });
};

exports.update = function(req, res) {

};

exports.activate = function(req, res) {

};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

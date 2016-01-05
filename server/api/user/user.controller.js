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
    // var newUser = new UserModel(req.body);
    // newUser.save(function(err, user) {
    //     res.json(user);
    // });
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
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        active: true,
        city: 'Philadelphia',
        state: 1,
        zip: req.body.zip,
        password: req.body.password
      }, function(err, thor){
        console.log('Finished adding user');
        res.send(200);
      }
    )
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

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
    var newUser = new UserModel(req.body);
    newUser.save(function(err, user) {
        res.json({
            token: token
        });
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
 * Connects a street to a user
 */
exports.setStreet = function(req, res, next) {
    var userId = req.params.id;
    var streetId = req.params.sid;

    if (!userId) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    UserModel.findById(userId, function(err, user) {
        if (err) return next(err);
        if(user.adoptedStreets.indexOf(streetId) > -1)
        {
          console.log(streetId);
          user.adoptedStreets.push(mongoose.Types.ObjectId(streetId));
          console.log(JSON.stringify(user.adoptedStreets));
          user.save(function(err, user){
            if (err) return next(err);
          });

          res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
        }
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

    UserModel.findOne({
        _id: userId
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
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

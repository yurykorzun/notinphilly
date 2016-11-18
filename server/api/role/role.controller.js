var mongoose      = require('mongoose');
var RoleModel    = require('./role.model');

exports.get = function(req, res, next) {
  RoleModel.find({}, function(err, roles) {
    if (err) return res.status(500).send(roles);

    res.status(200).json(roles);
  });
};

exports.getById = function(req, res, next) {
  var roleId = req.params.id;

  RoleModel.findById(roleId, function(err, statuses) {
    if (err) return res.status(500).send(statuses);

    res.status(200).json(statuses);
  });
};

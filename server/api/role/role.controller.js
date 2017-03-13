var mongoose      = require('mongoose');
var RoleModel     = require('./role.model');
var logger        = require('../../components/logger');

exports.get = function(req, res, next) {
  RoleModel.find({}, function(err, roles) {
    if (err) {
      logger.error("roleController.get " + error);
      res.status(500).send(roles);
    }
    else
    {
      res.status(200).json(roles);
    }
  });
};

exports.getById = function(req, res, next) {
  var roleId = req.params.id;

  RoleModel.findById(roleId, function(err, statuses) {
    if (err) {
      logger.error("roleController.getById " + error);
      res.status(500).send(statuses);
    } 
    else
    {
      res.status(200).json(statuses);
    }
  });
};

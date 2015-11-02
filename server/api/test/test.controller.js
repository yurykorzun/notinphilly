var mongoose = require('mongoose');

exports.seed = function(req, res) {
  var dbseeder = require('../../../server/config/dbseeder');
  console.log("Trying to seed");

  dbseeder();

  res.status(200).json({});
};

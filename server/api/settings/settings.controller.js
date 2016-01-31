var settings = require('../../config/settings');

exports.index = function(req, res) {
  res.status(200).json(settings.clientSettings);
};

var NeighborhoodModel = require('./neighborhood.model');

exports.index = function(req, res) {
  NeighborhoodModel.find({}, function(err, neighborhoods) {
      if (err) return res.status(500).send(err);
      res.status(200).json(neighborhoods);
  });
};

exports.get = function(req, res) {
  var neighborhoodId = req.params.id;

  NeighborhoodModel.findById(neighborhoodId, function(err, neighborhood) {
      if (err) return next(err);
      if (!user) return res.status(401).send('Unauthorized');
      res.json(neighborhood);
  });
};

var mongoose = require('mongoose');
var NeighborhoodModel = require('./neighborhood.model');
var StreetModel       = require('../street/streetSegment.model');

exports.index = function(req, res) {
  NeighborhoodModel.find({}, function(err, neighborhoods) {
      if (err) return res.status(500).send(err);
      res.status(200).json(neighborhoods);
  });
};

exports.getAllGeojson = function(req, res) {
  NeighborhoodModel.find({}, function(err, neighborhoods) {
      if (err) return res.status(500).send(err);

      var geoList = new Array();
      for(var nIndex = 0, length = neighborhoods.length; nIndex < length; nIndex++)
      {
        var neighborhood = neighborhoods[nIndex];
        var geoItem = neighborhood.geodata;
        geoItem.properties = {
          id : neighborhood._id,
          name: neighborhood.name,
          code: neighborhood.code,
          percentageAdoptedStreets: neighborhood.percentageAdoptedStreets,
          totalAdoptedStreets: neighborhood.totalAdoptedStreets,
          totalStreets: neighborhood.totalStreets,
          active: neighborhood.active
        };
        geoList.push(geoItem);
      }

      res.status(200).json(geoList);
  });
};

exports.get = function(req, res, next) {
  var neighborhoodId = req.params.id;

  NeighborhoodModel.findById(neighborhoodId, function(err, neighborhood) {
      if (err) return next(err);
      var neighborhoodObject = neighborhood.toObject();
      neighborhoodObject.id = neighborhoodObject._id;
      res.json(neighborhoodObject);
  });
};

exports.reconcileNeighborhoods = function(req, res, next) {
  NeighborhoodModel.find({ }, function(err, neighborhoods) {
      if (err) return next(err);

      for (var nIndex = 0, length = neighborhoods.length; nIndex < length; nIndex++)
      {
        var neighborhood = neighborhoods[nIndex];

        StreetModel.aggregate(
          [
              { '$match': { neighborhood: mongoose.Types.ObjectId(neighborhood._id) } },
              { '$group': { '_id': "$neighborhood", 'total': { '$sum': "$totalAdopters" } } }
          ],
          function(err, result) {
            if (err) return next(err);

            NeighborhoodModel.findById(result[0]._id, function(err, neighborhoodUpdate) {
                if (err) return next(err);

                neighborhoodUpdate.totalAdoptedStreets = result[0].total;
                neighborhoodUpdate.percentageAdoptedStreets =  Math.round(((neighborhood.totalAdoptedStreets / neighborhood.totalStreets) * 100));
                neighborhoodUpdate.save(function(err, savedNeighborhood)
                {
                  if (err) return next(err);

                  console.log(savedNeighborhood.code + " " + savedNeighborhood.totalAdoptedStreets);
                });
            });
          }
        );
      }

      res.status(200).json({completed: true});
  });
};


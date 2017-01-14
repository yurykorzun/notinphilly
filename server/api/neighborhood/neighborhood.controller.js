var mongoose = require('mongoose');
var neighborhoodService = require('../../service/neighborhoodService');
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

            neighborhoodService.setTotalAdoptedStreets(result[0]._id, result[0].total).then(
              function(result) {
                console.log(result.code + " " + result.totalAdoptedStreets);
              },
              function(error){
                next(error);               
              }
            )
          }
        );
      }

      res.status(200).json({completed: true});
  });
};


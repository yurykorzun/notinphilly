var mongoose = require('mongoose');
var StreetModel = require('./streetSegment.model');
var UserModel = require('../user/user.model');
var NeighborhoodModel = require('../neighborhood/neighborhood.model');
var Schema = mongoose.Schema;var Schema = mongoose.Schema;

exports.index = function(req, res, next) {
    res.json([]);
};

exports.get = function(req, res, next) {
    var streetId = req.params.sid;

    StreetModel.findById(streetId, function(err, street) {
        if (err) return next(err);
        res.status(200).json(street);
    });
};

exports.getByNeighborhood = function(req, res, next) {
    var neighborhoodId = req.params.nid;

    StreetModel.find({neighborhood: mongoose.Types.ObjectId(neighborhoodId)}, function(err, streets) {
        if (err) return next(err);
        res.status(200).json(streets);
    });
};

exports.getByNeighborhoodGeojson = function(req, res, next) {
    var neighborhoodId = req.params.nid;

    StreetModel.find({neighborhood: mongoose.Types.ObjectId(neighborhoodId)}, function(err, streets) {
        if (err) return next(err);

        var geoList = new Array();
        for(var nIndex = 0, length = streets.length; nIndex < length; nIndex++)
        {
          var street = streets[nIndex];
          var geoItem = street.geodata;
          geoItem.properties = {
            id: street._id,
            parentId: street.neighborhood,
            name: street.streetName,
            hundred: street.leftHundred,
            zipCode: street.zipLeft,
            type: street.type,
            totalAdopters: street.totalAdopters,
            isAdopted: street.totalAdopters > 0,
            active: street.active
          };
          geoList.push(geoItem);
        }

        res.status(200).json(geoList);
    });
};

/**
 * Connects a street to a user
 */
exports.adopt = function(req, res, next) {
    var user = req.user;
    var streetId = req.params.sid;

    if (!user) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    console.log(user._id);
    UserModel.findById(user._id, function(err, user) {
        if (err) return next(err);
        if(user.adoptedStreets.indexOf(streetId) == -1)
        {
          console.log(streetId);
          user.adoptedStreets.push(mongoose.Types.ObjectId(streetId));
          user.save(function(err, user){
            if (err) res.status(500).json(err);

            StreetModel.findById(streetId, function(err, street) {
              if (err) res.status(500).json(err);

              street.totalAdopters += 1;
              street.save(function(err, savedstreet){
              });

              NeighborhoodModel.findById(street.neighborhood, function(err, neighborhood) {
                if (err) res.status(500).json(err);

                neighborhood.totalAdoptedStreets += 1;
                neighborhood.percentageAdoptedStreets =  Math.round(((neighborhood.totalAdoptedStreets / neighborhood.totalStreets) * 100));
                neighborhood.save(function(err, savedNeighborhood){});
              });
            });

            res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
          });
        }
        else {
          res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
        }
    });
};

/**
 * Connects a street to a user
 */
exports.leave = function(req, res, next) {
    var user = req.user;
    var streetId = req.params.sid;

    if (!user) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    console.log(user._id);
    UserModel.findById(user._id, function(err, user) {
        if (err) return next(err);
        var adoptedStreetIndex = user.adoptedStreets.indexOf(streetId);
        if(adoptedStreetIndex > -1)
        {
          console.log(streetId);

          user.adoptedStreets.splice(adoptedStreetIndex, 1);
          user.save(function(err, savedUser){
            if (err) return next(err);

            StreetModel.findById(streetId, function(err, street) {
              if (err) return next(err);

              if(street.totalAdopters > 0)
              {
                street.totalAdopters -= 1;
                street.save(function(err, savedstreet){
                });
              }

              NeighborhoodModel.findById(street.neighborhood, function(err, neighborhood) {
                if (err) res.status(500).json(err);

                if(neighborhood.totalAdopters > 0) {
                  neighborhood.totalAdoptedStreets -= 1;
                  neighborhood.percentageAdoptedStreets = (neighborhood.totalAdoptedStreets / neighborhood.totalStreets) * 100;

                  neighborhood.save(function(err, savedNeighborhood){});
                }

              });
            });

            res.json({ "_id": savedUser._id, "adoptedStreets" : savedUser.adoptedStreets });
          });
        }
        else {
          res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
        }
    });
};

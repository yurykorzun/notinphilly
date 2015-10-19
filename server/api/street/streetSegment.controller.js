var mongoose = require('mongoose');
var StreetModel = require('./streetSegment.model');
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
          geoItem.properties = { id : street._id, parentId : street.neighborhood, name: street.streetName };
          geoList.push(geoItem);
        }

        res.status(200).json(geoList);
    });
};

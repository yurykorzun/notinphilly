var StreetModel = require('./streetSegment.model');

exports.index = function(req, res, next) {
    res.json([]);
};

exports.get = function(req, res, next) {
    var streetId = req.params.sid;

    StreetModel.findById(streetId, function(err, street) {
        if (err) return next(err);
        res.json(street);
    });
};

exports.getByNeighborhood = function(req, res, next) {
    var neighborhoodId = req.params.nid;

    StreetModel.find({neighborhood: neighborhoodId}, function(err, streets) {
        if (err) return next(err);
        res.json(streets);
    });
};

exports.getByNeighborhoodGeojson = function(req, res, next) {
    var neighborhoodId = req.params.nid;

    StreetModel.find({neighborhood: neighborhoodId}, function(err, streets) {
        if (err) return next(err);

        var geoList = new Array();
        for(var nIndex = 0, length = streets.length; nIndex < length; nIndex++)
        {
          var street = streets[nIndex];
          var geoItem = street.geodata;
          geoItem.properties = { id : street._id, parentId : street.neighborhood };
          geoList.push(geoItem);
        }

        res.json(streets);
    });
};

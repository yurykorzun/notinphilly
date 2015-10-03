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

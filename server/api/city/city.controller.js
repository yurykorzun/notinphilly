var mongoose            = require('mongoose');
var lodash              = require('lodash');
var CityModel           = require('./city.model');

var Schema = mongoose.Schema;

exports.index = function(req, res, next) {
    CityModel.findOne({}, function(err, city) {
        if (err) return next(err);

        res.status(200).json(city);
    });
};

exports.getGeojson = function(req, res) {
     CityModel.findOne({}, function(err, city) {
            var feature = {
                "type" : "Feature",
                "geometry": city["geometry"]
            };

            city["geometry"] = undefined;
            feature.properties = city;

            res.status(200).json(feature);
     });
};
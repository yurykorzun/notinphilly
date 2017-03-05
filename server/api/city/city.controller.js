var mongoose            = require('mongoose');
var lodash              = require('lodash');
var CityModel           = require('./city.model');
var logger              = require('../../components/logger');

var Schema = mongoose.Schema;

exports.index = function(req, res, next) {
    CityModel.findOne({}, function(err, city) {
        if (err) {
            logger.error("cityController.index " + err);
            next(err);
        } 
        else
        {
            res.status(200).json(city);
        }
    });
};

exports.getGeojson = function(req, res) {
     CityModel.findOne({}, function(err, city) {
            if (err) {
                logger.error("cityController.getGeojson " + err);
                next(err);
            } 
            else
            {
                var feature = {
                    "type" : "Feature",
                    "geometry": city["geometry"]
                };

                city["geometry"] = undefined;
                feature.properties = city;

                res.status(200).json(feature);
            }
     });
};
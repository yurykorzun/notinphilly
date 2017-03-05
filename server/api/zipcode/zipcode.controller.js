var mongoose            = require('mongoose');
var ZipcodeModel        = require('./zipcode.model');
var logger              = require('../../components/logger');

var Schema = mongoose.Schema;

exports.index = function(req, res, next) {
    ZipcodeModel.find({}, function(err, zipcodes) {
        if (err) {
            logger.error("zipcode.index " + err);
            next(err);
        } 
        else
        {
            res.status(200).json(zipcodes);
        }
    });
};

exports.getAllGeojson = function(req, res) {
     ZipcodeModel.find({}, function(err, zipcodes) {
        if (err) {
            logger.error("zipcode.getAllGeojson " + err);
            next(err);
        }
        else
        {
            var geoJSON = lodash.reduce(zipcodes, function(geoJSON, item){
                if(!geoJSON) geoJSON = [];

                var feature = {
                    "type" : "Feature",
                    "geometry": item["geometry"]
                };

                item["geometry"] = undefined;
                feature.properties = item;
                geoJSON.push(feature);

                return geoJSON;
            });
            
            res.status(200).json(geoJSON);
        }
     });
};
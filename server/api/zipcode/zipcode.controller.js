var lodash              = require('lodash');
var mongoose            = require('mongoose');
var ZipcodeModel        = require('./zipcode.model');
var zipcodeService      = require('../../service/zipcodeService');
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
    zipcodeService.getAllGeoJSON().then(function(geoJSON)
    {
       res.status(200).json(geoJSON);
    },
    function(error)
    {
      logger.error("zipcodeController.getAllGeojson " + error);    
      res.status(500).send(error);
    })
    .catch(function(error) {
        logger.error("zipcodeController.getAllGeojson " + error);    
        res.status(500).send(error);
    });
};
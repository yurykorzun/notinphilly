var mongoose            = require('mongoose');
var neighborhoodService = require('../../service/neighborhoodService');
var NeighborhoodModel   = require('./neighborhood.model');
var StreetModel         = require('../street/street.model');
var logger              = require('../../components/logger');

exports.index = function(req, res) {
  neighborhoodService.getAll().then(function(neighborhoods)
  {
     res.status(200).json(neighborhoods);
  },
  function(error)
  {
    logger.error("neighborhoodController.index " + error);
    res.status(500).send(error);
  });
};

exports.getAllGeojson = function(req, res) {
  neighborhoodService.getAllGeoJSON().then(function(geoJSON)
  {
     res.status(200).json(geoJSON);
  },
  function(error)
  {
    logger.error("neighborhoodController.getAllGeojson " + error);    
    res.status(500).send(error);
  });
};

exports.getByLocation = function(req, res, next) {
  var locationLat = req.body.lat;
  var locationLng = req.body.lng;

  neighborhoodService.getByLocation(locationLat, locationLng).then(
  function(neighborhood)
  {
     res.status(200).json(neighborhood);
  },
  function(error)
  {
    logger.error("neighborhoodController.getByLocation " + error);        
    res.status(500).send(error);
  });
}

exports.get = function(req, res, next) {
  var neighborhoodId = req.params.id;

  neighborhoodService.getById(neighborhoodId).then(function(neighborhood)
  {
     res.status(200).json(neighborhood);
  },
  function(error)
  {
    logger.error("neighborhoodController.get " + error);        
    res.status(500).send(error);
  });
};

exports.reconcileNeighborhoods = function(req, res, next) {
  neighborhoodService.reconcileNeighborhoods().then(function(result)
  {
    res.status(200).json({completed: true});
  },
  function(error)
  {
    logger.error("neighborhoodController.reconcileNeighborhoods " + error);            
    res.status(500).json(error);
  });
};


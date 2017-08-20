var lodash              = require('lodash');
var mongoose            = require('mongoose');
var NeighborhoodModel   = require('../api/neighborhood/neighborhood.model');
var StreetModel         = require('../api/street/street.model');
var logger              = require('../components/logger');

exports.getAll = function() {
    return getAll();
}

exports.getById = function(id) {
     return new Promise(function (fulfill, reject){
        NeighborhoodModel.findById(id, function(err, neighborhood) {
            if (err)
            {
                logger.error("neighborhoodService.getById " + err);
                reject("Failed retrieving neighborhood " + err);
            } 
            else fulfill(neighborhood);
        });
    });
}

exports.getAllGeoJSON = function() {
    return new Promise(function (fulfill, reject){
        getAll().then(function(result) {
            var geoJSON = lodash.reduce(result, function(geoJSON, item){
                if(!geoJSON) geoJSON = [];

                var feature = {
                    "type" : "Feature",
                    "geometry": item["geometry"]
                };

                item["geometry"] = undefined;
                feature.properties = item;
                geoJSON.push(feature);

                return geoJSON;
            }, []);

            fulfill(geoJSON);
        },
        function(error) {
            logger.error("neighborhoodService.getAllGeoJSON " + error);
            reject(error);
        });
    });
}

exports.getByLocation = function(locationLat, locationLng) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.findOne({"geometry": { 
                                    "$geoIntersects": {
                                    "$geometry": {
                                        "type": "Point",
                                        "coordinates": [locationLng, locationLat]
                                    }}
                                }}, function(err, neighborhood) {
            if (err)
            {
                logger.error("neighborhoodService.getByLocation " + err);
                reject("Failed retrieving neighborhood by location " + err);
            } 
            else fulfill(neighborhood);
        });
    });
}

exports.reconcileNeighborhoods = function()
{
    return new Promise(function (fulfill, reject){
        getAll().then(function(neighborhoods)
        {
            for (var nIndex = 0, length = neighborhoods.length; nIndex < length; nIndex++)
            {
                var neighborhood = neighborhoods[nIndex];

                StreetModel.aggregate(
                [
                    { '$match': { neighborhoods: { "$elemMatch": { "$eq": mongoose.Types.ObjectId(neighborhood._id) } } }},
                    { '$group': { '_id': mongoose.Types.ObjectId(neighborhood._id), 'total': { '$sum': "$totalAdopters" } } }
                ],
                function(err, result) {
                    if (err) {
                        logger.error("neighborhoodService.reconcileNeighborhoods " + err);            
                        reject(err);
                    }
                    else
                    {
                        exports.setTotalAdoptedStreets(result[0]._id, result[0].total).then(
                        function(result) {
                            logger.debug(result.name + " " + result.totalAdoptedStreets);            
                            fulfill(result);
                        },
                        function(error){
                            logger.error("neighborhoodService.reconcileNeighborhoods " + error);                                        
                            reject(error);               
                        });
                    }
                });
            }
        },
        function(error)
        {
            logger.error("neighborhoodService.reconcileNeighborhoods " + error);            
            reject(error);
        });
    });
}

exports.setTotalAdoptedStreets = function(neighborhoodId, totalAdoptedStreets) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.findById(neighborhoodId, function(err, neighborhood) {
            if (err)
            {
                logger.error("neighborhoodService.setTotalAdoptedStreets " + err); 
                reject("Failed while finding neighborhood " + err);           
            } 
            else
            {
                if (neighborhood.totalAdoptedStreets && neighborhood.totalAdoptedStreets > 0) {
                    neighborhood.totalAdoptedStreets = totalAdoptedStreets;
                }
                else neighborhood.totalAdoptedStreetss = 0;

                neighborhood.totalAdoptedStreets = totalAdoptedStreets;
                neighborhood.percentageAdoptedStreets = calculatePercentageAdoptedStreets(neighborhood.totalAdoptedStreets, neighborhood.totalStreets);
                neighborhood.save(function(err, savedNeighborhood){
                    if (err) {
                        logger.error("neighborhoodService.setTotalAdoptedStreets " + err); 
                        reject("Failed while saving neighborhood " + err);
                    } 
                    else fulfill(savedNeighborhood);
                });
            }
        });
    });
}

exports.incrementAdoptedStreets = function(neighborhoodIds) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.find({ "_id" : { "$in" : neighborhoodIds }}, function(err, neighborhoods) {
            if (err) {
                logger.error("neighborhoodService.incrementAdoptedStreets " + err); 
                reject("Failed while finding neighborhoods " + err);
            } 
            else
            {
                for(var i = 0; i < neighborhoods.length; i++)
                {
                    var neighborhood = neighborhoods[i];
                    neighborhood.totalAdoptedStreets++;
                    neighborhood.percentageAdoptedStreets = calculatePercentageAdoptedStreets(neighborhood.totalAdoptedStreets, neighborhood.totalStreets);
                    neighborhood.save(function(err, savedNeighborhood){
                        if (err) {
                            logger.error("neighborhoodService.incrementAdoptedStreets " + err);                 
                            reject("Failed while saving neighborhood " + err);
                        } 
                        else fulfill(savedNeighborhood);
                    });
                }
            }
        });
    });
}

exports.decrementAdoptedStreets = function(neighborhoodIds) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.find({ "_id" : { "$in" : neighborhoodIds }}, function(err, neighborhoods) {
            if (err) {
                logger.error("neighborhoodService.incrementAdoptedStreets " + err); 
                reject("Failed while finding neighborhoods " + err);
            } 
            else
            {
                for(var i = 0; i < neighborhoods.length; i++)
                {
                    var neighborhood = neighborhoods[i];
                    if (neighborhood.totalAdoptedStreets && neighborhood.totalAdoptedStreets > 0) neighborhood.totalAdoptedStreets--;
                    else neighborhood.totalAdoptedStreetss = 0;

                    neighborhood.percentageAdoptedStreets = calculatePercentageAdoptedStreets(neighborhood.totalAdoptedStreets, neighborhood.totalStreets);
                    neighborhood.save(function(err, savedNeighborhood){
                        if (err) {
                            logger.error("neighborhoodService.decrementAdoptedStreets " + err);                                 
                            reject("Failed while saving neighborhood " + err);
                        } 
                        else fulfill(savedNeighborhood);
                    });
                }
            }
        });
    });
}

var getAll = function() {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.find({}, function(err, neighborhoods) {
            if (err) {
                logger.error("neighborhoodService.getAll " + err);                                 
                reject("Failed retrieving neighborhoods " + err);
            } 
            else fulfill(neighborhoods);
        });
    });
}

var calculatePercentageAdoptedStreets = function(totalAdoptedStreets, totalStreets)
{
    return Math.round(((totalAdoptedStreets / totalStreets) * 100));
}
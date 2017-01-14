var promise                 = require('promise');
var lodash                  = require('lodash');
var StreetModel             = require('../api/street/streetSegment.model');
var NeighborhoodModel       = require('../api/neighborhood/neighborhood.model');
var neighborhoodService     = require('./neighborhoodService.js');

exports.incrementAdopters = function(streetIds) {
     return new Promise(function (fulfill, reject){
        if (!streetIds || streetIds.length === 0) 
        {
            fulfill();
        }
        else 
        {
            StreetModel.find({ _id: { $in: streetIds }}, function(err, existingStreets) {
                if (err) reject(err);
                else {
                    var streetSavePromises = [];
                    for (var streetIndex = 0; streetIndex < existingStreets.length; streetIndex++ )
                    {
                        var street = existingStreets[streetIndex];

                        street.totalAdopters++;

                        var savePromise = street.save();
                        streetSavePromises.push(savePromise);
                    }

                    promise.all(streetSavePromises)
                            .then(function (results) {
                                var neighborhoodSavePromises = [];
                                for (var i = 0; i < results.length; i++ )
                                {   
                                    var street = results[i];
                                    var savePromise = neighborhoodService.incrementAdoptedStreets(street.neighborhood);
                                }
                                neighborhoodSavePromises.push(savePromise);

                                return promise.all(neighborhoodSavePromises);
                            },
                            function(error) {
                                reject(error);
                            })
                            .then(function (results) {
                                fulfill(results);
                            },
                            function(error) { 
                                reject(error);
                            });
                }
            });
        }
     });
}

exports.decrementAdopters = function(streetIds) {
     return new Promise(function (fulfill, reject){
        if (!streetIds || streetIds.length === 0) 
        {
            fulfill();
        }
        else {
            StreetModel.find({ _id: { $in: streetIds }}, function(err, existingStreets) {
                if (err) reject(err);
                else {
                    var streetSavePromises = [];
                    for (var streetIndex = 0; streetIndex < existingStreets.length; streetIndex++ )
                    {
                        var street = existingStreets[streetIndex];

                        if (street.totalAdopters && street.totalAdopters > 0) street.totalAdopters--;
                        else street.totalAdopters = 0;

                        var savePromise = street.save();
                        streetSavePromises.push(savePromise);
                    }

                    
                    promise.all(streetSavePromises)
                            .then(function (results) {
                                var neighborhoodSavePromises = [];
                                for (var i = 0; i < results.length; i++ )
                                {   
                                    var street = results[i];
                                    var savePromise = neighborhoodService.decrementAdoptedStreets(street.neighborhood);
                                }
                                neighborhoodSavePromises.push(savePromise);

                                return promise.all(neighborhoodSavePromises);
                            },
                            function(error) {
                                reject(error);
                            })
                            .then(function (results) {
                                fulfill(results);
                            },
                            function(error) { 
                                reject(error);
                            });
                }
            });
        }
     });
}
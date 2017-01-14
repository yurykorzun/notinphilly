var NeighborhoodModel = require('../api/neighborhood/neighborhood.model');

exports.setTotalAdoptedStreets = function(neighborhoodId, totalAdoptedStreets) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.findById(neighborhoodId, function(err, neighborhood) {
            if (err) reject("Failed while finding neighborhood " + err);
            else
            {
                if (neighborhood.totalAdoptedStreets && neighborhood.totalAdoptedStreets > 0) {
                    neighborhood.totalAdoptedStreets = totalAdoptedStreets;
                }
                else neighborhood.totalAdoptedStreetss = 0;

                neighborhood.totalAdoptedStreets = totalAdoptedStreets;
                neighborhood.percentageAdoptedStreets = calculatePercentageAdoptedStreets(neighborhood.totalAdoptedStreets, neighborhood.totalStreets);
                neighborhood.save(function(err, savedNeighborhood){
                    if (err) reject("Failed while saving neighborhood " + err);
                    else fulfill(savedNeighborhood);
                });
            }
        });
    });
}

exports.incrementAdoptedStreets = function(neighborhoodId) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.findById(neighborhoodId, function(err, neighborhood) {
            if (err) reject("Failed while finding neighborhood " + err);
            else
            {
                neighborhood.totalAdoptedStreets++;
                neighborhood.percentageAdoptedStreets = calculatePercentageAdoptedStreets(neighborhood.totalAdoptedStreets, neighborhood.totalStreets);
                neighborhood.save(function(err, savedNeighborhood){
                    if (err) reject("Failed while saving neighborhood " + err);
                    else fulfill(savedNeighborhood);
                });
            }
        });
    });
}

exports.decrementAdoptedStreets = function(neighborhoodId) {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.findById(neighborhoodId, function(err, neighborhood) {
            if (err) reject("Failed while finding neighborhood " + err);
            else
            {
                if (neighborhood.totalAdoptedStreets && neighborhood.totalAdoptedStreets > 0) neighborhood.totalAdoptedStreets--;
                else neighborhood.totalAdoptedStreetss = 0;

                neighborhood.percentageAdoptedStreets = calculatePercentageAdoptedStreets(neighborhood.totalAdoptedStreets, neighborhood.totalStreets);
                neighborhood.save(function(err, savedNeighborhood){
                    if (err) reject("Failed while saving neighborhood " + err);
                    else fulfill(savedNeighborhood);
                });
            }
        });
    });
}

var calculatePercentageAdoptedStreets = function(totalAdoptedStreets, totalStreets)
{
    return Math.round(((totalAdoptedStreets / totalStreets) * 100));
}
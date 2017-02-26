var lodash              = require('lodash');
var NeighborhoodModel   = require('../api/neighborhood/neighborhood.model');

exports.getAll = function() {
    return getAll();
}

exports.getById = function(id) {
     return new Promise(function (fulfill, reject){
        NeighborhoodModel.findById(id, function(err, neighborhood) {
            if (err) reject("Failed retrieving neighborhood " + err);
            else fulfill(neighborhood);
        });
    });
}

exports.getAllGeoJSON = function() {
    return new Promise(function (fulfill, reject){
        getAll().then(function(result){
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
            reject(error);
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
                    { '$match': { neighborhood: mongoose.Types.ObjectId(neighborhood._id) } },
                    { '$group': { '_id': "$neighborhood", 'total': { '$sum': "$totalAdopters" } } }
                ],
                function(err, result) {
                    if (err) return reject(err);

                    exports.setTotalAdoptedStreets(result[0]._id, result[0].total).then(
                    function(result) {
                        console.log(result.code + " " + result.totalAdoptedStreets);
                        fulfill(result);
                    },
                    function(error){
                        reject(error);               
                    })
                });
            }
        },
        function(error)
        {
            reject(error);
        });
    });
}

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

var getAll = function() {
    return new Promise(function (fulfill, reject){
        NeighborhoodModel.find({}, function(err, neighborhoods) {
            if (err) reject("Failed retrieving neighborhoods " + err);
            else fulfill(neighborhoods);
        });
    });
}

var calculatePercentageAdoptedStreets = function(totalAdoptedStreets, totalStreets)
{
    return Math.round(((totalAdoptedStreets / totalStreets) * 100));
}
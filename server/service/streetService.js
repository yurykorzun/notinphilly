var promise                 = require('promise');
var lodash                  = require('lodash');
var mongoose                = require('mongoose');
var StreetModel             = require('../api/street/street.model');
var NeighborhoodModel       = require('../api/neighborhood/neighborhood.model');
var neighborhoodService     = require('./neighborhoodService.js');
var userService             = require('../service/userService')

exports.getAll = function() {
    return new Promise(function (fulfill, reject){
        StreetModel.find({}, function(err, streets) {
            if (err) reject("Failed retrieving streets " + err);
            else fulfill(streets);
        });
    });
};

exports.getById = function(id) {
    return new Promise(function (fulfill, reject){
        StreetModel.findById(id, function(err, street) {
            if (err) reject("Failed retrieving street " + err);
            else fulfill(street);
        });
    });
};

exports.getGeoJSONByUserId = function(userId) {
    return new Promise(function (fulfill, reject){
        userService.getById(userId).then(
        function(user)
        {
            StreetModel.find({'_id': { $in: user.adoptedStreets}})
            .sort({zipCode:1, streetName: 1})
            .exec(function(err, streets) {
                if (err) reject("Failed retrieving streets " + err);
                else
                {
                    setIsAdopted(streets, user).then(function(streets)
                    {
                        convertToGeoJSON(streets).then(function(streets){
                            fulfill(streets);
                        },
                        function(error) {
                            reject(error);
                        })
                    },
                    function(error) {
                        reject(error);
                    });
                } 
            });
        },
        function(error)
        {
             reject("Failed retrieving user " + err)
        });
        
    });
};

exports.getByNeighborhoodId = function(neighborhoodId) {
    return new Promise(function (fulfill, reject){
        StreetModel.find({neighborhood: mongoose.Types.ObjectId(neighborhoodId)}, 
        function(err, streets) {
            if (err) reject("Failed retrieving streets " + err);
            else fulfill(streets);
        });
    });
};

exports.getGeoJSONByNeighborhoodId = function(neighborhoodId, user) {
    return new Promise(function (fulfill, reject){
        StreetModel
        .find({neighborhood: mongoose.Types.ObjectId(neighborhoodId)})
        .populate('zipCode')
        .exec(function(err, streets) {
            if (err) reject("Failed retrieving streets " + err);
            else {
                if (user)
                {
                    setIsAdopted(streets, user).then(function(streets)
                    {
                        convertToGeoJSON(streets).then(function(streets){
                            fulfill(streets);
                        },
                        function(error) {
                            reject(error);
                        })
                    },
                    function(error) {
                        reject(error);
                    });
                }
                else
                {
                    convertToGeoJSON(streets).then(function(streets){
                        fulfill(streets);
                    },
                    function(error) {
                        reject(error);
                    })
                }
            } 
        });
    });
};

exports.getByLocation = function(locationLat, locationLng, user) {
    return new Promise(function (fulfill, reject){
          StreetModel.find({ 'geometry':
            { 
                '$near': {
                '$minDistance': 0,
                '$maxDistance': 90,
                '$geometry': { type: "Point",  coordinates: [locationLng, locationLat] }
                }
            }})
            .populate('zipCode')
            .exec(function(err, streets) {
                if (err) return reject(err);
                if (user)
                {
                    setIsAdopted(streets, user).then(function(streets)
                    {
                        convertToGeoJSON(streets).then(function(streets){
                            fulfill(streets);
                        },
                        function(error) {
                            reject(error);
                        })
                    },
                    function(error) {
                        reject(error);
                    });
                }
                else
                {
                    convertToGeoJSON(streets).then(function(streets){
                        fulfill(streets);
                    },
                    function(error) {
                        reject(error);
                    })
                }
            });
    });
};

exports.getByLocationPaged = function(locationLat, locationLng, page, take, user) {
    return new Promise(function (fulfill, reject){
        var skipRecords = (page - 1) * take;
        var findQuery = StreetModel.find({ 'geometry':
            { 
                '$near': 
                {
                    '$minDistance': 0,
                    '$maxDistance': 90,
                    '$geometry': { type: "Point",  coordinates: [locationLng, locationLat] }
                }
            }
        })
        .skip(skipRecords)
        .take(take)
        .populate('zipCode')
        .exec(function(err, streets) {
            if (err) return reject(err);

            if (user)
            {
                setIsAdopted(streets, user).then(function(streets)
                {
                    convertToGeoJSON(streets).then(function(streets){
                        res.status(200).json({ streets: streets, total: streets.length, page: page, take: take  });
                    },
                    function(error) {
                        res.status(500).json("Search failed");
                    })
                },
                function(error) {
                    res.status(500).json("Search failed");
                });
            }
            else
            {
                convertToGeoJSON(streets).then(function(streets){
                    res.status(200).json({ streets: streets, total: streets.length, page: page, take: take  });
                },
                function(error) {
                    res.status(500).json("Search failed");
                })
            }
        });
    });
}

exports.adopt = function(userId, streetId) {
    return new Promise(function (fulfill, reject){
        userService.getUserById(userId).then(
        function(user)
        {
            if(user.adoptedStreets.indexOf(streetId) == -1)
            {
                user.adoptedStreets.push(mongoose.Types.ObjectId(streetId));
                user.save(function(err, user) {
                    if (err) reject(err);

                    incrementAdopters([streetId]).then(
                        function(result) {
                            fulfill({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
                        },
                        function(error) {
                            reject(error);
                        }
                    )
                });
            }
            else {
                fulfill({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
            }
        },
        function(error){
            reject(error);
        })
    });
}

exports.leave = function(userId, streetId) {
    return new Promise(function (fulfill, reject){
        userService.getUserById(userId).then(
        function(user)
        {
            var adoptedStreetIndex = user.adoptedStreets.indexOf(streetId);
            if(adoptedStreetIndex > -1)
            {
                user.adoptedStreets.splice(adoptedStreetIndex, 1);
                user.save(function(err, savedUser){
                    if (err) return reject(err);

                    streetService.decrementAdopters([streetId]).then(
                    function(result) {
                        fulfill({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
                    },
                    function(error) {
                        reject(error);
                    });
                });
            }
            else {
                fulfill({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
            }
        },
        function(error){
            reject(error);
        });
    });
}

exports.reconcileAdoptedStreets = function() {
    return new Promise(function (fulfill, reject){
        userService.getAll(function(users) {
            var streetAdopterNumbers = {};
            var streetIds = [];
            for (var userIndex = 0; userIndex < users.length; userIndex++)
            {
                var user = users[userIndex];
                var adoptedStreetsIds = user.adoptedStreets;
                if (adoptedStreetsIds)
                {
                    for (var streetIndex = 0; streetIndex < adoptedStreetsIds.length; streetIndex++ )
                    {
                        var adoptedStreetId = adoptedStreetsIds[streetIndex];
                        streetIds.push(mongoose.Types.ObjectId(adoptedStreetId));
                        if(!streetAdopterNumbers[adoptedStreetId])
                        {
                            streetAdopterNumbers[adoptedStreetId] = 0;
                        }

                        streetAdopterNumbers[adoptedStreetId]++;
                    }
                }
            }

            StreetModel.update({}, { $set: { totalAdopters : 0 } }, {multi: true}, function(err, streets) {
                if (err) return reject(err);

                for (var property in streetAdopterNumbers) {
                    if (streetAdopterNumbers.hasOwnProperty(property))
                    {
                        StreetModel.update({_id: mongoose.Types.ObjectId(property) }, { $set: { totalAdopters : streetAdopterNumbers[property] } }, {multi: true}, function(err, streets) {
                            if (err) return reject(err);
                        });
                    }
                }

                fulfill({ result : streetAdopterNumbers });
            });
        },
        function(error)
        {
            reject(error);
        });
    },
    function(error)
    {
        reject(error);
    });
}

exports.incrementAdopters = function(streetIds) {
    return incrementAdopters();
}

exports.decrementAdopters = function(streetIds) {
     return decrementAdopters();
}

var incrementAdopters = function(streetIds)
{
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

var decrementAdopters = function(streetIds)
{
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

var convertToGeoJSON = function(streets)
{
    return new Promise(function (fulfill, reject){
        var geoJSON = lodash.reduce(streets, function(geoJSON, item){
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
}

var setIsAdopted = function(streets, user)
{
     return new Promise(function (fulfill, reject){
        var updatedStreets = lodash.map(streets, function(item){
            item.isAdoptedByUser = isStreetAdoptedByUser(user, item);

            return item;
        });

        fulfill(updatedStreets);
    },
    function(error) {
        reject(error);
    });
}

var isStreetAdoptedByUser = function(user, street) {
  if (user == undefined) return false;

  if (user.adoptedStreets && user.adoptedStreets.indexOf(street._id) == -1 && street.totalAdopters <=5) {
    return false;
  }

  if (user.adoptedStreets && (user.adoptedStreets.indexOf(street._id) > -1 || street.totalAdopters > 5)) {
    return true;
  }

  if (user.adoptedStreets && street.totalAdopters === 0 && street.totalAdopters <=5) {
    return false;
  }

  if (user.adoptedStreets && street.totalAdopters > 0 || street.totalAdopters > 5) {
    return true;
  }
}
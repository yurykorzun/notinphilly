var mongoose = require('mongoose');
var StreetModel = require('./streetSegment.model');
var StreetZipcodesModel = require('../street/streetZipcodes.model');
var StreetNamesModel = require('../street/streetNames.model');
var UserModel = require('../user/user.model');
var NeighborhoodModel = require('../neighborhood/neighborhood.model');


var Schema = mongoose.Schema;

exports.index = function(req, res, next) {
    res.json([]);
};

function convertStreetsData(user, streetsResult)
{
  var geoList = new Array();
  for(var nIndex = 0, length = streetsResult.length; nIndex < length; nIndex++)
  {
    var street = streetsResult[nIndex];
    var geoItem = street.geodata;

    geoItem.properties = {
      id: street._id,
      parentId: street.neighborhood,
      name: street.streetName,
      hundred: street.leftHundred === 0 ? (street.rightHundred === 0 ? undefined : street.rightHundred) : street.leftHundred,
      zipCode: street.zipLeft,
      type: street.type,
      totalAdopters: street.totalAdopters,
      isAdoptedByUser: isStreetAdoptedByUser(user, street),
      active: street.active
    };
    geoList.push(geoItem);
  }

  return geoList;
}

exports.get = function(req, res, next) {
    var streetId = req.params.sid;

    StreetModel.findById(streetId, function(err, street) {
        if (err) return next(err);
        street.hundred = street.leftHundred === 0 ? (street.rightHundred === 0 ? undefined : street.rightHundred) : street.leftHundred;
        res.status(200).json(street);
    });
};

exports.getByNeighborhood = function(req, res, next) {
    var neighborhoodId = req.params.nid;

    StreetModel.find({neighborhood: mongoose.Types.ObjectId(neighborhoodId)}, function(err, streets) {
        if (err) return next(err);
        res.status(200).json(streets);
    });
};


exports.getByLocation = function(req, res, next) {
    var locationLat = req.body.lat;
    var locationLng = req.body.lng;

    var user = {};
    //Get user info
    if (typeof req.user !== 'undefined') {
      UserModel.findById(req.user._id, function(err, userFound) {
          if (err) return next(err);
          user = userFound;
        });
    }
    var findQuery = StreetModel.find({ 'geodata.geometry':
      { '$near': {
      '$minDistance': 0,
      '$maxDistance': 90,
      '$geometry': { type: "Point",  coordinates: [locationLng, locationLat] }
      }}
    })
    .exec(function(err, streets) {
        if (err) return next(err);

        var convertedResult = convertStreetsData(user, streets);
        res.status(200).json(convertedResult);
    });
};

exports.getByLocationPaged = function(req, res, next) {
    var locationLat = req.body.lat;
    var locationLng = req.body.lng;
    var page = parseInt(req.params.page);
    var take = parseInt(req.params.take);

    var user = {};
    //Get user info
    if (typeof req.user !== 'undefined') {
      UserModel.findById(req.user._id, function(err, userFound) {
          if (err) return next(err);
          user = userFound;
        });
    }
    var skipRecords = (page - 1) * take;
    var findQuery = StreetModel.find({ 'geodata.geometry':
      { '$near': {
      '$minDistance': 0,
      '$maxDistance': 90,
      '$geometry': { type: "Point",  coordinates: [locationLng, locationLat] }
      }}
    })
    .skip(skipRecords)
    .exec(function(err, streets) {
        if (err) return next(err);

        var geoList = new Array();
        var takeItems = streets.length >= take ? take : streets.length;

        for(var nIndex = 0, length = takeItems; nIndex < length; nIndex++)
        {
          var street = streets[nIndex];
          var geoItem = street.geodata;

          geoItem.properties = {
            id: street._id,
            parentId: street.neighborhood,
            name: street.streetName,
            hundred: street.leftHundred === 0 ? (street.rightHundred === 0 ? undefined : street.rightHundred) : street.leftHundred,
            zipCode: street.zipLeft,
            type: street.type,
            totalAdopters: street.totalAdopters,
            isAdoptedByUser: isStreetAdoptedByUser(user, street),
            active: street.active
          };
          geoList.push(geoItem);
        }
        res.status(200).json({ streets: geoList, total: streets.length, page: page, take: take  });
    });
};

exports.getByNeighborhoodGeojson = function(req, res, next) {
    var neighborhoodId = req.params.nid;
    var user = {};
    //Get user info
    if (typeof req.user !== 'undefined') {
      UserModel.findById(req.user._id, function(err, userFound) {
          if (err) return next(err);
          user = userFound;
        });
    }

    StreetModel.find({neighborhood: mongoose.Types.ObjectId(neighborhoodId)}, function(err, streets) {
        if (err) return next(err);

        var convertedResult = convertStreetsData(user, streets);
        res.status(200).json(convertedResult);
    });
};

var isStreetAdoptedByUser = function(user, street) {
  if (typeof user.adoptedStreets !== 'undefined' && user.adoptedStreets.indexOf(street._id) == -1 && street.totalAdopters <=5) {
    return false;
  }

  if (typeof user.adoptedStreets !== 'undefined' && (user.adoptedStreets.indexOf(street._id) > -1 || street.totalAdopters > 5)) {
    return true;
  }

  if (typeof user.adoptedStreets === 'undefined' && street.totalAdopters === 0 && street.totalAdopters <=5) {
    return false;
  }

  if (typeof user.adoptedStreets === 'undefined' && street.totalAdopters > 0 || street.totalAdopters > 5) {
    return true;
  }
}

/**
 * Connects a street to a user
 */
exports.adopt = function(req, res, next) {
    var user = req.user;
    var streetId = req.params.sid;

    if (!user) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    console.log(user._id);

    UserModel.findById(user._id, function(err, user) {
        if (err) return next(err);
        if(user.adoptedStreets.indexOf(streetId) == -1)
        {
          console.log(streetId);
          user.adoptedStreets.push(mongoose.Types.ObjectId(streetId));
          user.save(function(err, user){
            if (err) res.status(500).json(err);

            StreetModel.findById(streetId, function(err, street) {
              if (err) res.status(500).json(err);

              street.totalAdopters += 1;
              street.save(function(err, savedstreet){
              });

              NeighborhoodModel.findById(street.neighborhood, function(err, neighborhood) {
                if (err) res.status(500).json(err);

                neighborhood.totalAdoptedStreets += 1;
                neighborhood.percentageAdoptedStreets =  Math.round(((neighborhood.totalAdoptedStreets / neighborhood.totalStreets) * 100));
                neighborhood.save(function(err, savedNeighborhood){});
              });
            });

            res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
          });
        }
        else {
          res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
        }
    });
};

/**
 * Connects a street to a user
 */
exports.leave = function(req, res, next) {
    var user = req.user;
    var streetId = req.params.sid;

    if (!user) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    console.log(user._id);
    UserModel.findById(user._id, function(err, user) {
        if (err) return next(err);
        var adoptedStreetIndex = user.adoptedStreets.indexOf(streetId);
        if(adoptedStreetIndex > -1)
        {
          console.log(streetId);

          user.adoptedStreets.splice(adoptedStreetIndex, 1);
          user.save(function(err, savedUser){
            if (err) return next(err);

            StreetModel.findById(streetId, function(err, street) {
              if (err) return next(err);

              if(street.totalAdopters > 0)
              {
                street.totalAdopters -= 1;
                street.save(function(err, savedstreet){
                });
              }

              NeighborhoodModel.findById(street.neighborhood, function(err, neighborhood) {
                if (err) res.status(500).json(err);

                if(neighborhood.totalAdoptedStreets > 0) {
                  neighborhood.totalAdoptedStreets -= 1;
                  neighborhood.percentageAdoptedStreets =  Math.round((neighborhood.totalAdoptedStreets / neighborhood.totalStreets) * 100);
                }
                else {
                  neighborhood.percentageAdoptedStreets = 0;
                }

                neighborhood.save(function(err, savedNeighborhood){});

              });
            });

            res.json({ "_id": savedUser._id, "adoptedStreets" : savedUser.adoptedStreets });
          });
        }
        else {
          res.json({ "_id": user._id, "adoptedStreets" : user.adoptedStreets });
        }
    });
};

exports.findStreets = function(req, res, next) {
    var streetName = req.params.street;
    var houseNumber = req.params.house;

    var blockPrefix = houseNumber.toString().length > 2 ? houseNumber.toString().slice(0, -2) : houseNumber;
    var streetRegex = new RegExp(streetName, 'i');
    var blockRegex = new RegExp(blockPrefix, 'i');

    StreetModel.find({  streetName: { $regex: streetRegex },
                        block: { $regex: blockRegex }
                      },
                function(err, streets) {
                    if (err) return next(err);
                    res.json({ streets: streets });
                });
};

exports.currentUserStreets = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    UserModel.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');

        StreetModel.find({'_id': { $in: user.adoptedStreets}}, function(err, streets) {
          var convertedResult = convertStreetsData(user, streets);
          res.status(200).json(convertedResult);
        });
    }).sort({zipCode:1, streetName: 1}); ;
};

exports.getStreetNames = function(req, res, next) {
  var query = req.params.name;
  var limit = req.params.limit;

  var regex = new RegExp("^" + query, 'i');

  StreetNamesModel.find({ name: { $regex : regex } },
                        undefined,
                        {sort:  { name: 1 }, limit: limit },
                        function(err, names){
                          if (err) return next(err);
                          res.json(names);
                        });
};

exports.getZipCodes = function(req, res, next) {
  var query = req.params.zip;
  var limit = req.params.limit;

  var regex = new RegExp("^" + query, 'i');

  StreetZipcodesModel.find({ zipCode: regex  },
                            undefined,
                            {sort:  { name: 1 }, limit: limit },
                            function(err, codes){
                              if (err) return next(err);
                              res.json(codes);
                            });
};

exports.getStreetNamesPaged = function(req, res, next) {
  var page = req.params.page;
  var skip = req.params.skip;
  var query = req.params.name;

  var regex = new RegExp("^" + query, 'i');
  var itemsToSkip = (page - 1) * skip;

  StreetNamesModel.find({ name: { $regex : regex } },
                        undefined,
                        {sort:  { name: 1 }, skip:itemsToSkip, limit: skip },
                        function(err, names){
                          if (err) return next(err);
                          res.json(names);
                        });
};

exports.getZipCodesPaged = function(req, res, next) {
  var page = req.params.page;
  var skip = req.params.skip;
  var query = req.params.zip;

  var regex = new RegExp("^" + query, 'i');
  var itemsToSkip = (page - 1) * skip;

  StreetZipcodesModel.find({ zipCode: regex  },
                            undefined,
                            {sort:  { zipCode: 1 }, skip:itemsToSkip, limit: skip },
                            function(err, codes){
                              if (err) return next(err);
                              res.json(codes);
                            });
};

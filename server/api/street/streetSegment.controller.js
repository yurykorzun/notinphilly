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

exports.get = function(req, res, next) {
    var streetId = req.params.sid;

    StreetModel.findById(streetId, function(err, street) {
        if (err) return next(err);
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

        var geoList = new Array();
        for(var nIndex = 0, length = streets.length; nIndex < length; nIndex++)
        {
          var street = streets[nIndex];
          var geoItem = street.geodata;

          geoItem.properties = {
            id: street._id,
            parentId: street.neighborhood,
            name: street.streetName,
            hundred: street.leftHundred,
            zipCode: street.zipLeft,
            type: street.type,
            totalAdopters: street.totalAdopters,
            isAdopted: isStreetAdoptedByUser(user, street),
            active: street.active
          };
          geoList.push(geoItem);
        }
        res.status(200).json(geoList);
    });
};

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
    var zipCode = req.params.zip;
    var streetName = req.params.street;
    var houseNumber = req.params.house;

    var blockPrefix = houseNumber.substring(0, 2);
    var streetRegex = new RegExp(streetName, 'i');

    StreetModel.find({  streetName: { $regex: streetRegex },
                        $where: "/" + zipCode + "/.test(this.zipLeft) | /" + zipCode + "/.test(this.zipRight)",
                        $where: "/^" + blockPrefix + "/.test(this.leftHundred) | /^" + blockPrefix + "/.test(this.rightHundred)"
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
          res.json(streets);
        });
    }).sort({zipCode:1, streetName: 1}); ;
};

exports.getStreetNames = function(req, res, next) {
  var query = req.params.name;
  var limit = req.params.limit;

  var regex = new RegExp("^" + query, 'i');

  StreetNamesModel.find({ name: { $regex : regex } },
                  undefined, {sort:  { name: 1 }, limit: limit },
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
                      undefined, {sort:  { name: 1 }, limit: limit },
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

  StreetNamesModel.find({ name: { $regex : regex } }, undefined,
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

  StreetZipcodesModel.find({ zipCode: regex  }, undefined,
                      {sort:  { zipCode: 1 }, skip:itemsToSkip, limit: skip },
                      function(err, codes){
                        if (err) return next(err);
                        res.json(codes);
                      });
};

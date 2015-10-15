var mongoose       = require('mongoose');
var fs             = require('fs');
var path           = require('path');
var arrayFind = require('array-find');

var streetsJson = fs.readFileSync(path.resolve(__dirname, "../misc/streetsData.json"), 'utf8');
var neigborhoodJson = fs.readFileSync(path.resolve(__dirname, "../misc/neighborhoodData.json"), 'utf8');

var neighborhoodsObj = JSON.parse(neigborhoodJson);
var streetsObj = JSON.parse(streetsJson);

var StreetSegmentModel = require('../api/street/streetSegment.model');
var NeighborhoodModel = require('../api/neighborhood/neighborhood.model');
var StateModel = require('../api/state/state.model');
var RoleModel = require('../api/role/role.model');
var UserModel = require('../api/user/user.model');

console.log('starting to seed the database');

StreetSegmentModel.find({}).remove({}, function(err) {
  console.log('Seeding Streets');
  NeighborhoodModel.find({}).remove({}, function(err) {
    console.log('Seeding Neighborhoods');
    for(var neighborhoodDataIndex = 0; neighborhoodDataIndex < neighborhoodsObj.length; neighborhoodDataIndex++)
    {
      var neighborhoodRecord = neighborhoodsObj[neighborhoodDataIndex];
      var neighborhoodProperties = neighborhoodRecord.properties;

      var neighborhoodGeoData = {"type":"Feature", "geometry": neighborhoodRecord.geometry };
      var newNeighborhood = new NeighborhoodModel({
        name: neighborhoodProperties.listname,
        code: neighborhoodProperties.name,
        geodata: neighborhoodGeoData
      });

      newNeighborhood.save(function(err, thor) {
        if (err) return console.error(err);

        var streetsData = arrayFind(streetsObj, function (element, index, array) {
          return element.name == thor.code;
        });

        var streets = streetsData.data;

        for(var streetIndex = 0; streetIndex <  streets.length; streetIndex++)
        {
          var street = streets[streetIndex].properties;
          var streetGeoData = {"type":"Feature", "geometry": streets[streetIndex].geometry };

          var newStreetSegment = new StreetSegmentModel({
            streetName: street.ST_NAME,
            neighborhood: thor._id,
            type: street.ST_TYPE,
            length: street.LENGTH,
            zipLeft: street.ZIP_LEFT,
            zipRight: street.ZIP_RIGHT,
            code: street.ST_CODE,
            leftHundred: street.L_HUNDRED,
            rightHundred: street.R_HUNDRED,
            segmentId: street.SEG_ID,
            oneWay: street.ONEWAY,
            class: street.CLASS,
            geodata: streetGeoData
         });

         newStreetSegment.save(function(err, thor) {
           if (err) return console.error(err);
         });
        }
    });
  }
  console.log('Finished seeding Streets and Neighborhoods');
  });
});

UserModel.find({}).remove(function() {
    console.log('Seeding Users');
    UserModel.create({
      firstName: 'Yury',
      middleName: undefined,
      lastName: 'Korzun',
      birthDate: Date('1987-05-01'),
      phoneNumber: '123456789',
      email: 'test@test.me',
      role: 1,
      businesName: 'Not in Philly',
      addressLine1: 'Main st. 1',
      addressLine2: undefined,
      city: 'Philadelphia',
      state: 1,
      zip: '19103',
      username: 'test@test.me',
      password: '1234test'
    }, function(err, thor) {
      if (err) return console.error(err);

      console.log('Finished seeding Users');
    });
});

StateModel.find({}).remove(function() {
    console.log('Seeding States');
    StateModel.create(
        {
            "_id": 1,
            "name": 'Pennsylvania',
            "abbrev": 'PA'
        },
        {
              "_id": 2,
              "name": 'New Jersey',
              "abbrev": 'NJ'
          }, {
            "_id": 3,
            "name": 'New York',
            "abbrev": 'NY'
        }
    , function(err, thor) {
      if (err) return console.error(err);

      console.log('Finished seeding States');
    });
});

RoleModel.find({}).remove(function() {
    console.log('Seeding Roles');
    RoleModel.create({
            "_id": 1,
            "name": 'Admin'
        },
        {
            "_id": 2,
            "name": 'Champion'
        }, {
            "_id": 3,
            "name": 'Leader'
        }, {
            "_id": 4,
            "name": 'User'
        }, {
            "_id": 5,
            "name": 'Visitor'
        }
    , function(err, thor) {
      if (err) return console.error(err);

      console.log('Finished seeding Roles');
    });
});

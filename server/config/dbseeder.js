var mongoose       = require('mongoose');
var fs             = require('fs');
var path           = require('path');
var arrayFind      = require('array-find');
var StreetSegmentModel = require('../api/street/streetSegment.model');
var NeighborhoodModel = require('../api/neighborhood/neighborhood.model');
var StateModel = require('../api/state/state.model');
var RoleModel = require('../api/role/role.model');
var UserModel = require('../api/user/user.model');

module.exports = function(res) {
  var streetsJson     = fs.readFileSync(path.resolve(__dirname, "../misc/streetsData.json"), 'utf8');
  var neigborhoodJson = fs.readFileSync(path.resolve(__dirname, "../misc/neighborhoodData.json"), 'utf8');

  var neighborhoodsObj = JSON.parse(neigborhoodJson);
  var streetsObj       = JSON.parse(streetsJson);

  var neighborhoodInclude = ['COBBS_CREEK', 'WEST_PARK', 'EAST_PARK', 'FITLER_SQUARE', 'WALNUT_HILL', 'SOCIETY_HILL', 'OLD_CITY', 'CENTER_CITY', 'GARDEN_COURT', 'WOODLAND_TERRACE', 'UNIVERSITY_CITY', 'POWELTON', 'SPRUCE_HILL', 'CEDAR_PARK', 'LOGAN_SQUARE', 'FAIRMOUNT', 'SPRING_GARDEN', 'CALLOWHILL', 'CHINATOWN', 'RITTENHOUSE', 'WASHINGTON_SQUARE'];

  res.send('starting to seed the database');
  console.log('starting to seed the database');
  StreetSegmentModel.find({}).remove({}, function(err) {
    console.log('Seeding Streets');
    NeighborhoodModel.find({}).remove({}, function(err) {
      console.log('Seeding Neighborhoods');

      for(var neighborhoodDataIndex = 0; neighborhoodDataIndex < neighborhoodsObj.length; neighborhoodDataIndex++)
      {
        var neighborhoodRecord = neighborhoodsObj[neighborhoodDataIndex];
        var neighborhoodProperties = neighborhoodRecord.properties;

        var streetsFound = arrayFind(streetsObj, function (element, index, array) {
          return element.name == neighborhoodProperties.name;
        });

        var neighborhoodGeoData = {"type":"Feature", "geometry": neighborhoodRecord.geometry };
        var newNeighborhood = new NeighborhoodModel({
          name: neighborhoodProperties.listname,
          code: neighborhoodProperties.name,
          active: neighborhoodInclude.indexOf(neighborhoodProperties.name) > -1,
          totalStreets: streetsFound.data.length,
          geodata: neighborhoodGeoData
        });

        newNeighborhood.save(function(err, newNeighborhood) {
          if(neighborhoodInclude.indexOf(newNeighborhood.code) > -1)
          {
            if (err) return console.error(err);

            var streetsData = arrayFind(streetsObj, function (element, index, array) {
              return element.name == newNeighborhood.code;
            });

            console.log("Saved neighborhood " + newNeighborhood.name);
            var streets = streetsData.data;

            console.log("Streets " + streets.length);
            for(var streetIndex = 0; streetIndex <  streets.length; streetIndex++)
            {
              var street = streets[streetIndex].properties;
              var streetGeoData = {"type":"Feature", "geometry": streets[streetIndex].geometry };

              var newStreetSegment = new StreetSegmentModel({
                streetName: street.ST_NAME,
                neighborhood: newNeighborhood._id,
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
                active: true,
                geodata: streetGeoData
             });

             newStreetSegment.save(function(err, newStreet) {
               if (err) return console.error(err);
             });
            }
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
        role: [1],
        businesName: 'Not in Philly',
        addressLine1: 'Main st. 1',
        addressLine2: undefined,
        active: true,
        city: 'Philadelphia',
        state: 1,
        zip: '19103',
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
}

var mongoose       = require('mongoose');
var fs             = require('fs');
var path           = require('path');
var arrayFind      = require('array-find');

var StreetSegmentModel = require('../api/street/streetSegment.model');
var NeighborhoodModel = require('../api/neighborhood/neighborhood.model');
var StateModel = require('../api/state/state.model');
var RoleModel = require('../api/role/role.model');
var UserModel = require('../api/user/user.model');
var StreetNamesModel = require('../api/street/streetNames.model');
var StreetZipsModel = require('../api/street/streetZipcodes.model');

module.exports = function(res) {
  var streetsJson     = fs.readFileSync(path.resolve(__dirname, "../misc/streetsData.json"), 'utf8');
  var neigborhoodJson = fs.readFileSync(path.resolve(__dirname, "../misc/neighborhoodData.json"), 'utf8');

  var neighborhoodsObj = JSON.parse(neigborhoodJson);
  var streetsObj       = JSON.parse(streetsJson);

  var neighborhoodInclude = ['COBBS_CREEK', 'WEST_PARK', 'EAST_PARK', 'FITLER_SQUARE', 'WALNUT_HILL', 'SOCIETY_HILL', 'OLD_CITY', 'CENTER_CITY', 'GARDEN_COURT', 'WOODLAND_TERRACE', 'UNIVERSITY_CITY', 'POWELTON', 'SPRUCE_HILL', 'CEDAR_PARK', 'LOGAN_SQUARE', 'FAIRMOUNT', 'SPRING_GARDEN', 'CALLOWHILL', 'CHINATOWN', 'RITTENHOUSE', 'WASHINGTON_SQUARE'];

  StreetSegmentModel.find({}).remove(function() {
    NeighborhoodModel.find({}).remove(function()  {
      var neighborhoods = new Array();

      for(var neighborhoodDataIndex = 0; neighborhoodDataIndex < neighborhoodsObj.length; neighborhoodDataIndex++)
      {
        var neighborhoodRecord = neighborhoodsObj[neighborhoodDataIndex];
        var neighborhoodProperties = neighborhoodRecord.properties;

        var streetsFound = arrayFind(streetsObj, function (element, index, array) {
          return element.name === neighborhoodProperties.name;
        });

        var neighborhoodGeoData = {"type":"Feature", "geometry": neighborhoodRecord.geometry };
        var newNeighborhood = {
          name: neighborhoodProperties.listname,
          code: neighborhoodProperties.name,
          active: neighborhoodInclude.indexOf(neighborhoodProperties.name) > -1,
          totalStreets: streetsFound.data.length,
          geodata: neighborhoodGeoData
        };

        neighborhoods.push(newNeighborhood);
      }

      console.log('starting to seed the database');
      NeighborhoodModel.create(neighborhoods, function(err, createdNeighborhoods)
      {
        if (err) return console.error(err);


          console.log('Saved neighborhoods ' + createdNeighborhoods.length);

          var neighborhoodsAllowed = createdNeighborhoods.filter(function(item){
            return neighborhoodInclude.indexOf(item.code) > -1;
          });

          for(var savedIndex = 0; savedIndex < neighborhoodsAllowed.length; savedIndex++)
          {
            var savedNeighborhood = neighborhoodsAllowed[savedIndex];

            var streetsData = arrayFind(streetsObj, function (element, index, array) {
              return element.name == savedNeighborhood.code;
            });

            var disallowed = ['EXPY', 'RAMP'];
            var streetsFound = streetsData.data.filter(function(street){
              return disallowed.indexOf(street.properties.ST_TYPE) === -1;
            });

            var streets = new Array();
            for(var streetIndex = 0; streetIndex <  streetsFound.length; streetIndex++)
            {
              var street = streetsFound[streetIndex].properties;
              var streetGeoData = {"type":"Feature", "geometry": street.geometry };

              var newStreetSegment = {
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
             };

             streets.push(newStreetSegment);
            }

            console.log('Saving Streets ' + savedNeighborhood.name + ' ' + streets.length);
            if(savedIndex < neighborhoodsAllowed.length-1)
            {
              StreetSegmentModel.create(streets, function(err, createdStreets) {
                if (err) return console.error(err);
                console.log('Saved Streets ' + createdStreets.length);

              });
            }
            else {
              StreetSegmentModel.create(streets, function(err, createdStreets) {
                if (err) return console.error(err);
                console.log('Saved last portion of streets ' + createdStreets.length);

                console.log('Saving aggregate street names');
                StreetNamesModel.find({}).remove(function() {
                  StreetSegmentModel.aggregate(
                    [
                      { "$group": {
                          "_id": '$streetName'
                      }},
                      { "$sort": { "streetName": 1 } }
                    ],
                    function(err, result) {
                      for(var resultIndex = 0; resultIndex < result.length; resultIndex++)
                      {
                        var streetName = result[resultIndex]._id;

                      StreetNamesModel.create({
                            name: streetName
                        });
                      }
                    });
                });

                console.log('Saving aggregate street zipcodes');
                StreetZipsModel.find({}).remove(function() {
                  StreetSegmentModel.aggregate(
                    [
                      { "$group": {
                          "_id": '$zipLeft'
                      }},
                      { "$sort": { "zipLeft": 1 } }
                    ],
                    function(err, result) {
                      for(var resultIndex = 0; resultIndex < result.length; resultIndex++)
                      {
                        var zipCode = result[resultIndex]._id;

                        StreetZipsModel.create({
                            zipCode: zipCode
                        });
                      }
                    });
              });

          });
        }
      }
          console.log('Saving streets');
      });

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

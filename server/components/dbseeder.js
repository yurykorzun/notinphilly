var mongoose       = require('mongoose');
var fs             = require('fs');
var path           = require('path');
var arrayFind      = require('array-find');

var StreetSegmentModel = require('../api/street/street.model');
var NeighborhoodModel = require('../api/neighborhood/neighborhood.model');
var StateModel = require('../api/state/state.model');
var RoleModel = require('../api/role/role.model');
var UserModel = require('../api/user/user.model');

module.exports = function() {
  var streetsJson     = fs.readFileSync(path.resolve(__dirname, "../misc/streetsData.json"), 'utf8');
  var neigborhoodJson = fs.readFileSync(path.resolve(__dirname, "../misc/neighborhoodData.json"), 'utf8');

  var neighborhoodsObj = JSON.parse(neigborhoodJson);
  var streetsObj       = JSON.parse(streetsJson);

  //var neighborhoodInclude = ['COBBS_CREEK', 'WEST_PARK', 'EAST_PARK', 'FITLER_SQUARE', 'WALNUT_HILL', 'SOCIETY_HILL', 'OLD_CITY', 'CENTER_CITY', 'GARDEN_COURT', 'WOODLAND_TERRACE', 'UNIVERSITY_CITY', 'POWELTON', 'SPRUCE_HILL', 'CEDAR_PARK', 'LOGAN_SQUARE', 'FAIRMOUNT', 'SPRING_GARDEN', 'CALLOWHILL', 'CHINATOWN', 'RITTENHOUSE', 'WASHINGTON_SQUARE'];

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
          //active: neighborhoodInclude.indexOf(neighborhoodProperties.name) > -1,
          active: true,
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

          /*var neighborhoodsAllowed = createdNeighborhoods.filter(function(item){
            return neighborhoodInclude.indexOf(item.code) > -1;
          });*/

          var streets = new Array();
          for(var savedIndex = 0; savedIndex < createdNeighborhoods.length; savedIndex++)
          {
            var savedNeighborhood = createdNeighborhoods[savedIndex];

            var streetsData = arrayFind(streetsObj, function (element, index, array) {
              return element.name == savedNeighborhood.code;
            });

            var disallowed = ['EXPY', 'RAMP'];
            var streetsFound = streetsData.data.filter(function(street){
              return disallowed.indexOf(street.properties.ST_TYPE) === -1;
            });

            for(var streetIndex = 0; streetIndex <  streetsFound.length; streetIndex++)
            {
              var street = streetsFound[streetIndex].properties;
              var streetGeoData = {"type":"Feature", "geometry": streetsFound[streetIndex].geometry };

              var newStreetSegment = {
                streetName: street.ST_NAME,
                neighborhood: savedNeighborhood._id,
                type: street.ST_TYPE,
                length: street.LENGTH,
                zipLeft: street.ZIP_LEFT,
                zipRight: street.ZIP_RIGHT,
                code: street.ST_CODE,
                //slice the block number from the address
                block: street.L_HUNDRED.toString().length > 2 ? street.L_HUNDRED.toString().slice(0, -2) : street.L_HUNDRED,
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
          }

          console.log('Saving Streets ' + streets.length);
          StreetSegmentModel.collection.insertMany(streets, function(err, createdStreets) {
            if (err) return console.error(err);
            console.log('Saved Streets ' + JSON.stringify(createdStreets.result));

            console.log('Saving aggregate street names');
            StreetNamesModel.find({}).remove(function() {
              StreetSegmentModel.aggregate(
                [
                  { "$group": { "_id": '$streetName'}},{ "$sort": { "streetName": 1 } }
                ],
                function(err, result) {
                  if (err) return console.error(err);

                  console.log('Saved street names '  + result.length);
                  var streetNames = new Array();
                  for(var resultIndex = 0; resultIndex < result.length; resultIndex++)
                  {
                    var streetName = result[resultIndex]._id;

                    streetNames.push({
                          name: streetName
                    });
                  }

                  StreetNamesModel.collection.insertMany(streetNames, function(err, createdSreetNames) { });
                });
            });

            console.log('Saving aggregate street zipcodes');
            StreetZipsModel.find({}).remove(function() {
              StreetSegmentModel.aggregate(
                [
                  { "$group": {  "_id": '$zipLeft'}},{ "$sort": { "zipLeft": 1 } }
                ],
                function(err, result) {
                  if (err) return console.error(err);

                  console.log('Saved street zipcodes ' + result.length);
                  var zipCodes = new Array();
                  for(var resultIndex = 0; resultIndex < result.length; resultIndex++)
                  {
                    var zipCode = result[resultIndex]._id;

                    if(zipCode && zipCode > 0)
                    {
                      zipCodes.push({
                          zipCode: zipCode.toString()
                      });
                    }
                  }

                  StreetZipsModel.collection.insertMany(zipCodes, function(err, createdZipCodes) { });
                });
              });
          });

      });

    });
});


  UserModel.find({}).remove(function() {
      console.log('Seeding Users');
      UserModel.create({
        firstName: 'Test',
        middleName: undefined,
        lastName: 'Test',
        birthDate: Date('1987-05-01'),
        phoneNumber: '123456789',
        email: 'test@test.me',
        role: [1],
        businessName: 'Not in Philly',
        houseNumber: '2222',
        streetName: 'Main',
        apartmentNumber: '123',
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

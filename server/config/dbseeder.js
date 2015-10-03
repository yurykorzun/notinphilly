var mongoose       = require('mongoose');
var fs             = require('fs');
var path           = require('path');
var arrayFind = require('array-find');

var streetsJson = fs.readFileSync(path.resolve(__dirname, "../../client/public/js/streetsData.json"), 'utf8');
var neigborhoodJson = fs.readFileSync(path.resolve(__dirname, "../../client/public/js/neighborhoodData.json"), 'utf8');

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
    for(var streetDataIndex = 0; streetDataIndex< streetsObj.length; streetDataIndex++)
    {
      var streetsRecord = streetsObj[streetDataIndex];
      var neighborhoodName = streetsRecord.name;

      var streetsData = streetsRecord.data;
      var neighborhoodData = arrayFind(neighborhoodsObj, function (element, index, array) {
        return element.properties.name == neighborhoodName;
      });
      var neighborhoodProperties = neighborhoodData.properties;

      var neighborhoodGeoData = {"type":"Feature", "geometry": neighborhoodData.geometry };
      var newNeighborhood = new NeighborhoodModel({ name: neighborhoodProperties.listname, code: neighborhoodProperties.name, geodata: neighborhoodGeoData  });
      newNeighborhood.save(function(err, thor) {
        if (err) return console.error(err);

        for(var streetIndex = 0; streetIndex <  streetsData.length; streetIndex++)
        {
          var street = streetsData[streetIndex].properties;

          var streetGeoData = {"type":"Feature", "geometry": street.geometry };
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
    , function(e) {
      console.log('Finished seeding States');
    });
});

RoleModel.find({}).remove(function() {
    console.log('Seeding Roles');
    RoleModel.create({
            "_id": 1,
            "name": 'Admin'
        }, {
            "_id": 2,
            "name": 'Leader'
        }, {
            "_id": 3,
            "name": 'User'
        }, {
            "_id": 4,
            "name": 'Visitor'
        }
    , function(e) {
      console.log('Finished seeding Roles');
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
      state: 'PA',
      zip: '19103',
      username: 'test@test.me',
      password: '1234test'
    }, function(e) {
      console.log('Finished seeding Users');
    });
});

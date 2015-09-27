// modules =================================================
var express        = require('express');
var mongoose       = require('mongoose');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var path           = require('path');

// configuration ===========================================
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080;

app.models =

mongoose.connection.on('error', console.log);
mongoose.connect("mongodb://localhost/notinphilly");

//experiments with file
var fs = require('fs');
var streetsJson = fs.readFileSync(path.resolve(__dirname, "public/js/streetsData.json"), 'utf8');
var neigborhoodJson = fs.readFileSync(path.resolve(__dirname, "public/js/neighborhoodData.json"), 'utf8');

var neighborhoodsObj = JSON.parse(neigborhoodJson);
var streetsObj = JSON.parse(streetsJson);

var arrayFind = require('array-find');

var StreetSegmentModel = require('./app/models/streetSegment');
var NeighborhoodModel = require('./app/models/neighborhood');

StreetSegmentModel.find({}).remove();
NeighborhoodModel.find({}).remove();

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
    console.dir(thor);

    for(var streetIndex = 0; streetIndex <  streetsData.length; streetIndex++)
    {
      var street = streetsData[streetIndex];
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
       console.dir(thor);
     });
    }
  });
}

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// routes ==================================================
//require('./app/routes/home')(app); // configure our routes
//require('./app/routes/users')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('Magic happens on port ' + port);

// expose app
exports = module.exports = app;

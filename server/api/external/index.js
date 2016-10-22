var express   = require('express');
var settings  = require('../../config/apiSettings');

var router = express.Router();

router.get('/google-maps-api/:library',  function (req, res, next) {
  var library = req.params.library;

  res.redirect('https://maps.googleapis.com/maps/api/js?libraries=' + library + '&key=' + settings.GOOGLE_API_KEY);
});

router.get('/google-streetview-api/:lat/:lng/',  function (req, res, next) {
  var lat = req.params.lat;
  var lng = req.params.lng;

  res.redirect("https://maps.googleapis.com/maps/api/streetview?size=270x120&location=" +  lat + "," + lng  + "&key=" + settings.GOOGLE_API_KEY);
});

router.get('/mapbox-statcmap/:lat/:lng/',  function (req, res, next) {
  var lat = req.params.lat;
  var lng = req.params.lng;

  res.redirect("https://api.mapbox.com/styles/v1/yurykorzun/cimv1ezcc00sqb8m7z8e3yeiz/static/" +  lat + "," + lng  + ",15/120x95?logo=false&access_token=" + settings.MAP_BOX_API_KEY);
});

router.get('/mapbox-map-credentials/',  function (req, res, next) {

  res.status(200).json({
    apiKey: settings.MAP_BOX_API_KEY,
    mapId: settings.MAP_BOX_MAP_ID
  });
});


module.exports = router;

var express = require('express');
var controller = require('./city.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/getGeoJSON', controller.getGeojson);


module.exports = router;

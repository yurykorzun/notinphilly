var express = require('express');
var controller = require('./zipcode.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/getAllGeojson', controller.getAllGeojson);

module.exports = router;

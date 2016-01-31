var express = require('express');
var controller = require('./settings.controller');

var router = express.Router();

router.get('/', controller.index);

module.exports = router;

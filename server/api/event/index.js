var express = require('express');
var controller = require('./event.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/facebook', controller.getFacebookEvents);

module.exports = router;
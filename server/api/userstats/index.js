var express = require('express');
var controller = require('./userstats.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/checkin/:id', controller.checkin);

module.exports = router;

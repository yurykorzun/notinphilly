var express = require('express');
var controller = require('./messages.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAuthenticated, controller.index);


module.exports = router;










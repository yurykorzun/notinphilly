var express = require('express');
var controller = require('./inventory.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAdmin, controller.get);
router.post('/', authService.isAdmin, controller.create);
router.put('/', authService.isAdmin, controller.update);

module.exports = router;

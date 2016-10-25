var express = require('express');
var controller = require('./inventory.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAdmin, controller.get);
router.post('/', authService.isAdmin, controller.create);
router.put('/', authService.isAdmin, controller.update);
router.get('/user/:userid', authService.isAdmin, controller.getByUser);
router.get('/user/', controller.getByUser);
router.get('/avaiable/', controller.toolAvailable);


module.exports = router;

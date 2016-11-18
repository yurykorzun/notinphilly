var express = require('express');
var controller = require('./neighborhood.controller');
var authService = require('../../auth/authService');

var router = express.Router();

//Get all neighborhoods
router.get('/', controller.index);
//Get all neighborhoods geojson
router.get('/getAllGeojson/', controller.getAllGeojson);
router.get('/reconcile/', authService.isAdmin, controller.reconcileNeighborhoods);
//Get single neighborhood by id
router.get('/:id', controller.get);

module.exports = router;

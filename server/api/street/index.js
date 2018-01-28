var express = require('express');
var controller = require('./street.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', controller.index);
router.get('/getAllGeojson/', controller.getAllGeojson);
router.get('/current/', authService.isAuthenticated, controller.currentUserStreets);
router.get('/currentGeoJSON', authService.isAuthenticated, controller.currentUserStreetsGeoJSON);
router.get('/byparent/:nid', controller.getByNeighborhood);
router.get('/byparentgeo/:nid', controller.getByNeighborhoodGeojson);
router.get('/byzipcodegeo/:zid', controller.getByZipcodeGeojson);
router.get('/adopt/:sid', authService.isAuthenticated, controller.adopt);
router.get('/leave/:sid', authService.isAuthenticated, controller.leave);
router.get('/reconcile/', authService.isAdmin, controller.reconcileAdoptedStreets);
router.get('/currentLocationGeoJSON', authService.isAuthenticated, controller.getGeoJSONCurrentUserAndByLocation);
router.get('/:sid', controller.get);

router.post('/byLocation/', controller.getByLocation);
router.post('/byLocationGeoJSON/', controller.getGeoJSONByLocation);

module.exports = router;

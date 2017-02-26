var express = require('express');
var controller = require('./street.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', controller.index);
router.get('/current/', authService.isAuthenticated, controller.currentUserStreets);
router.get('/byparent/:nid', controller.getByNeighborhood);
router.get('/byparentgeo/:nid', controller.getByNeighborhoodGeojson);
router.get('/adopt/:sid', authService.isAuthenticated, controller.adopt);
router.get('/leave/:sid', authService.isAuthenticated, controller.leave);
router.get('/reconcile/', authService.isAdmin, controller.reconcileAdoptedStreets);
router.get('/:sid', controller.get);
router.post('/byloc/', controller.getByLocation);

module.exports = router;

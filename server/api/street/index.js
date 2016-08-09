var express = require('express');
var controller = require('./streetSegment.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', controller.index);
router.get('/current/', authService.isAuthenticated, controller.currentUserStreets);
router.get('/:sid', controller.get);
router.get('/byparent/:nid', controller.getByNeighborhood);
router.get('/byparentgeo/:nid', controller.getByNeighborhoodGeojson);
router.get('/adopt/:sid', authService.isAuthenticated, controller.adopt);
router.get('/leave/:sid', authService.isAuthenticated, controller.leave);
router.get('/findstreets/:street/:house', controller.findStreets);

router.post('/byloc/', controller.getByLocation);

router.get('/lookupZipcodes/:zip/:limit', controller.getZipCodes);
router.get('/lookupNames/:name/:limit', controller.getStreetNames);

module.exports = router;

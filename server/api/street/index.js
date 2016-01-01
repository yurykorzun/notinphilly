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

router.get('/lookupZipcodes/:zip/', controller.getZipCodes);
router.get('/lookupNames/:name/', controller.getStreetNames);

//router.get('/findBlock/:block', controller.findBlock);


module.exports = router;

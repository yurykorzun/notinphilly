var express = require('express');
var controller = require('./streetSegment.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:sid', controller.get);
router.get('/byparent/:nid', controller.getByNeighborhood);
router.get('/byparentgeo/:nid', controller.getByNeighborhoodGeojson);

module.exports = router;

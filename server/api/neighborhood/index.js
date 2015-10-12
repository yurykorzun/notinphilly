var express = require('express');
var controller = require('./neighborhood.controller');

var router = express.Router();

//Get all neighborhoods
router.get('/', controller.index);
//Get single neighborhood by id
router.get('/:id', controller.get);

module.exports = router;

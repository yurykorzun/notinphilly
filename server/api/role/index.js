var express = require('express');
var controller = require('./role.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.get);

module.exports = router;

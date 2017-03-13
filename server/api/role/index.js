var express = require('express');
var controller = require('./role.controller');

var router = express.Router();

router.get('/', controller.get);
router.get('/:id', controller.getById);

module.exports = router;

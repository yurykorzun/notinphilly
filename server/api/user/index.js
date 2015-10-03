var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

//router.get('/', auth.hasRole('admin'), controller.index);
router.get('/', controller.index);
router.get('/:id', controller.get);
router.delete('/:id', controller.destroy);
router.get('/me', controller.me);
router.post('/', controller.create);
router.post('/:id', controller.update);

module.exports = router;

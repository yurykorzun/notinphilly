var express = require('express');
var controller = require('./user.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.get);
router.delete('/:id', authService.isAuthenticated, controller.destroy);
router.get('/me', authService.isAuthenticated, controller.me);
router.post('/', controller.create);
router.post('/:id', authService.isAuthenticated, controller.update);

module.exports = router;

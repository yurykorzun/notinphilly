var express = require('express');
var controller = require('./user.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAuthenticated, controller.index);
router.get('/current/', authService.isAuthenticated, controller.me);
router.get('/:id', controller.get);
router.delete('/:id', authService.isAuthenticated, controller.destroy);
router.post('/', controller.create);
router.post('/:id', authService.isAuthenticated, controller.update);

module.exports = router;

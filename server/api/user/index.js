var express = require('express');
var controller = require('./user.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAdmin, controller.index);
router.get('/paged', authService.isAdmin, controller.getAllPaged);
router.get('/current/', authService.isAuthenticated, controller.me);
router.get('/:id', authService.isAdmin, controller.get);
router.get('/confirm/:activationId', controller.activate);
router.delete('/:id', authService.isAdmin, controller.destroy);
router.post('/', controller.create);
router.put('/', authService.isAuthenticated, controller.update);
router.put('/:id', authService.isAuthenticated, controller.update);

module.exports = router;

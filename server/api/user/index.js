var express = require('express');
var controller = require('./user.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAdmin, controller.index);
router.get('/paged/:pageNumber/:pageSize/:sortColumn/:sortDirection', authService.isAdmin, controller.getAllPaged);
router.get('/current/', authService.isAuthenticated, controller.me);
router.get('/neighbors/', authService.isAuthenticated, controller.findNeighbors);
router.get('/neighbors/count', authService.isAuthenticated, controller.findNeighborsCount);
router.get('/confirm/:activationId', controller.activate);
router.get('/exportcsv', authService.isAdmin, controller.exportUsersCSV);
router.get('/:id', authService.isAdmin, controller.get);

router.post('/changePassword/', authService.isAuthenticated, controller.changePassword);
router.post('/resetPassword/', controller.resetPassword);
router.post('/', controller.create);

router.delete('/:id', authService.isAdmin, controller.destroy);

router.put('/', authService.isAuthenticated, controller.update);
router.put('/:id', authService.isAuthenticated, controller.update);


module.exports = router;

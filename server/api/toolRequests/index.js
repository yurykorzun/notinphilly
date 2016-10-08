var express = require('express');
var controller = require('./toolRequest.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAdmin, controller.get);
router.get('/paged/:pageNumber/:pageSize/:sortColumn/:sortDirection', authService.isAdmin, controller.getPaged);
router.get('/current', controller.getForUser);
router.get('/current/count', controller.countForCurrentUser);
router.post('/', controller.create);
router.put('/', authService.isAdmin, controller.update);
router.delete('/:id', authService.isAdmin, controller.destroy);
router.get('/statuses', controller.getStatuses);
router.post('/status', authService.isAdmin, controller.changeStatus);

module.exports = router;

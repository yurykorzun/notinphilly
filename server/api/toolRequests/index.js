var express = require('express');
var controller = require('./toolRequest.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAdmin, controller.get);
router.get('/paged/:pageNumber/:pageSize/:sortColumn/:sortDirection', authService.isAdmin, controller.getPaged);
router.get('/statuses', authService.isAdmin, controller.getStatuses);
router.post('/', authService.isAdmin, controller.create);
router.put('/', authService.isAdmin, controller.update);
router.post('/status/:id/:status', authService.isAdmin, controller.changeStatus);

module.exports = router;

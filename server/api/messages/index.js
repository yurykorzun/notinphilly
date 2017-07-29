var express = require('express');
var controller = require('./messages.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAuthenticated, controller.index);
router.get('/count', authService.isAuthenticated, controller.getAllCount);
router.get('/unread', authService.isAuthenticated, controller.getAllUnread);
router.get('/unread/count', authService.isAuthenticated, controller.getUnreadCount);
router.get('/unread/count/:senderUserId', authService.isAuthenticated, controller.getUnreadCountByUserId);
router.get('/paged/:pageNumber/:pageSize', authService.isAuthenticated, controller.getAllPaged);
router.get('/connections', authService.isAuthenticated, controller.getConnectedUsers);
router.get('/:messageId', authService.isAuthenticated, controller.getById);

router.post('/markasread', authService.isAuthenticated, controller.markMessagesAsRead);
router.post('/send', authService.isAuthenticated, controller.sendMessage);
router.post('/connections/request', authService.isAuthenticated, controller.requestConnectionWithUser);
router.post('/connections/approve', authService.isAuthenticated, controller.approveUserConnection);
router.post('/connections/cancel', authService.isAuthenticated, controller.cancelUserConnection);
router.post('/connections/mute', authService.isAuthenticated, controller.muteUser);
router.post('/connections/unmute', authService.isAuthenticated, controller.unmuteUser);

router.delete('/:messageId', authService.isAuthenticated, controller.deleteMessage);

module.exports = router;










var express = require('express');
var controller = require('./messages.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAuthenticated, controller.index);
router.get('/received/count', authService.isAuthenticated, controller.getReceivedAllCount);
router.get('/received/unread', authService.isAuthenticated, controller.getReceivedAllUnread);
router.get('/received/unread/count', authService.isAuthenticated, controller.getReceivedUnreadCount);
router.get('/received/unread/count/:senderUserId', authService.isAuthenticated, controller.getReceivedUnreadCountByUserId);
router.get('/received/paged/:pageNumber/:pageSize', authService.isAuthenticated, controller.getReceivedAllPaged);
router.get('/sent/paged/:pageNumber/:pageSize', authService.isAuthenticated, controller.getSentAllPaged);
router.get('/contacts', authService.isAuthenticated, controller.getAllUserContacts);
router.get('/contacts/connected', authService.isAuthenticated, controller.getConnectedUsers);
router.get('/:messageId', authService.isAuthenticated, controller.getReceivedById);

router.post('/markasread', authService.isAuthenticated, controller.markReceivedMessagesAsRead);
router.post('/send', authService.isAuthenticated, controller.sendMessage);
router.post('/send/multiple', authService.isAuthenticated, controller.sendMessages);
router.post('/connections/request', authService.isAuthenticated, controller.requestConnectionWithUser);
router.post('/connections/request/near', authService.isAuthenticated, controller.requestConnectionsWithNearUsers);
router.post('/connections/approve', authService.isAuthenticated, controller.approveUserConnection);
router.post('/connections/cancel', authService.isAuthenticated, controller.cancelUserConnection);
router.post('/connections/mute', authService.isAuthenticated, controller.muteUser);
router.post('/connections/unmute', authService.isAuthenticated, controller.unmuteUser);

router.delete('/:messageId', authService.isAuthenticated, controller.deleteMessage);

module.exports = router;










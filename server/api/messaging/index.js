var express = require('express');
var controller = require('./messaging.controller');
var authService = require('../../auth/authService');

var router = express.Router();

router.get('/', authService.isAuthenticated, controller.index);
router.get('/unread/', authService.isAuthenticated, controller.getAllUnread);
router.get('/unreadCount/', authService.isAuthenticated, controller.getUnreadCount);
router.get('/unreadCount/:userid', authService.isAuthenticated, controller.getUnreadCountByUserId);
router.get('/unreadUserIds/', authService.isAuthenticated, controller.getUnreadUserIds);
router.get('/:userid', authService.isAuthenticated, controller.getByUserId);

router.post('/markasread/', authService.isAuthenticated, controller.markMessagesAsRead);
router.post('/create/', authService.isAuthenticated, controller.createNewMessage);
router.post('/request/:userid', authService.isAuthenticated, controller.requestUserConnection);
router.post('/approve/:userid', authService.isAuthenticated, controller.approveUserConnection);
router.post('/cancel/:userid', authService.isAuthenticated, controller.cancelUserConnection);
router.post('/mute/:userid', authService.isAuthenticated, controller.muteUser);
router.post('/unmute/:userid', authService.isAuthenticated, controller.unmuteUser);

router.delete('/:messageid', authService.isAuthenticated, controller.deleteMessage);

module.exports = router;










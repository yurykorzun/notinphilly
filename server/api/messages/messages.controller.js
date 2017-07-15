var mongoose        = require('mongoose');
var messageStatus   = require('./messagestatus.model');
var message         = require('./message.model');
var messageService  = require('../../service/messagingService');
var logger          = require('../../components/logger');

exports.index = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('User id is missing');
    
    messageService.getAll(userId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.index " + error);
        res.status(500).send(error);
    });
};

exports.getAllUnread = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('User id is missing');
    
    messageService.getAllUnread(userId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.getAllUnread " + error);
        res.status(500).send(error);
    });
};

exports.getUnreadCount = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('User id is missing');
    
    messageService.getUnreadCount(userId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.getUnreadCount " + error);
        res.status(500).send(error);
    });
};

exports.getUnreadCountByUserId = function(req, res, next) {
    var recipientUserId = req.user._id;
    var senderUserId = req.params.senderUserId;

    if (!recipientUserId) throw new Error('Recipient user id is missing');
    if (!senderUserId) throw new Error('User id is missing');    
    
    messageService.getUnreadCountByUserId(recipientUserId, senderUserId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.getUnreadCountByUserId " + error);
        res.status(500).send(error);
    });
};

exports.getById = function(req, res, next) {
    var recipientUserId = req.user._id;
    var messageId = req.params.messageId;

    if (!recipientUserId) throw new Error('Recipient user id is missing');
    if (!messageId) throw new Error('Message id is missing');   

    messageService.getById(recipientUserId, messageId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.getById " + error);
        res.status(500).send(error);
    });
};

exports.deleteMessage = function(req, res, next) {
    var recipientUserId = req.user._id;
    var messageId = req.params.messageId;

    if (!recipientUserId) throw new Error('Recipient user id is missing');
    if (!messageId) throw new Error('Message id is missing');   

    messageService.deleteMessage(recipientUserId, messageId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.deleteMessage " + error);
        res.status(500).send(error);
    });
};

exports.markMessagesAsRead = function(req, res, next) {
    var recipientUserId = req.user._id;
    var messageIds = req.body.messageIds;

    if (!recipientUserId) throw new Error('Recipient user id is missing');
    if (!messageIds) throw new Error('Message ids is missing');   

    messageService.markMessagesAsRead(recipientUserId, messageIds).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.markMessagesAsRead " + error);
        res.status(500).send(error);
    });
};

exports.requestConnectionWithUser = function(req, res, next) {
    var userId = req.user._id;
    var userIdToConnect = req.params.userIdToConnect;

    if (!userId) throw new Error('User id is missing');
    if (!userIdToConnect) throw new Error('user id to connect is missing');   

     messageService.requestConnectionWithUser(userId, userIdToConnect).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.requestConnectionWithUser " + error);
        res.status(500).send(error);
    });
};

exports.approveUserConnection = function(req, res, next) {
    var userId = req.user._id;
    var pendingUserId = req.params.pendingUserId;

    if (!userId) throw new Error('User id is missing');
    if (!pendingUserId) throw new Error('user id pending is missing');   

     messageService.approveUserConnection(userId, pendingUserId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.approveUserConnection " + error);
        res.status(500).send(error);
    });
};

exports.cancelUserConnection = function(req, res, next) {
    var userId = req.user._id;
    var cancelUserId = req.params.cancelUserId;

    if (!userId) throw new Error('User id is missing');
    if (!cancelUserId) throw new Error('user id cancel is missing');   

    messageService.cancelUserConnection(userId, cancelUserId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.cancelUserConnection " + error);
        res.status(500).send(error);
    });
};

exports.getConnectedUsers = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('User id is missing');

    messageService.getConnectedUsers(userId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.getConnectedUsers " + error);
        res.status(500).send(error);
    });
};

exports.sendMessage = function(req, res, next) {
    var userId = req.user._id;
    var recipientUserId = req.body.recipientUserId;
    var subject = req.body.subject;
    var messageContents = req.body.messageContents;

    if (!userId) throw new Error('User id is missing');
    if (!recipientUserId) throw new Error('Recipient user id is missing');    
    if (!messageContents) throw new Error('Message contents is missing');    

    messageService.sendMessage(userId, recipientUserId, subject, messageContents).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.sendMessage " + error);
        res.status(500).send(error);
    });
};

exports.muteUser = function(req, res, next) {
    var userId = req.user._id;
    var muteUserId = req.body.muteUserId;

    if (!userId) throw new Error('User id is missing');
    if (!muteUserId) throw new Error('Mute user id is missing');  

    messageService.muteUser(userId, muteUserId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.muteUser " + error);
        res.status(500).send(error);
    });
};

exports.unmuteUser = function(req, res, next) {
    var userId = req.user._id;
    var unmuteUserId = req.body.unmuteUserId;

    if (!userId) throw new Error('User id is missing');
    if (!unmuteUserId) throw new Error('Unmute user id is missing');  

    messageService.unmuteUser(userId, unmuteUserId).then( function(result) {
        res.status(200).json(result);
    },
    function(error) {
        logger.error("messagesController.unmuteUser " + error);
        res.status(500).send(error);
    });
};
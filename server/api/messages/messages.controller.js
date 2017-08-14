var mongoose        = require('mongoose');
var messageStatus   = require('./messagestatus.model');
var message         = require('./message.model');
var messageService  = require('../../service/messagingService');
var logger          = require('../../components/logger');

exports.index = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');
        
        messageService.getReceivedAll(userId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.index " + error);
            res.status(400).send("Messages retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.index " + error);
            res.status(500).send("Messages retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getReceivedAllPaged = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');

        var page = req.params.pageNumber;
        var pageSize = req.params.pageSize;

        var limit = parseInt(pageSize);
        var itemsToSkip = (page - 1) * limit;

        messageService.getReceivedAllPaged(userId, itemsToSkip, limit).then(
                        function(result) {
                            res.status(200).json(result);
                        },
                        function(error) {
                            logger.error("messagesController.getAllPaged " + error);                        
                            res.status(500).send("Messages retrieval failed");
                        })
                        .catch(function(error) {
                            logger.error("messagesController.getAllPaged " + error);                        
                            res.status(500).send("Messages retrieval failed");
                        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
}

exports.getSentAllPaged = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');

        var page = req.params.pageNumber;
        var pageSize = req.params.pageSize;

        var limit = parseInt(pageSize);
        var itemsToSkip = (page - 1) * limit;

        messageService.getSentAllPaged(userId, itemsToSkip, limit).then(
                        function(result) {
                            res.status(200).json(result);
                        },
                        function(error) {
                            logger.error("messagesController.getSentAllPaged " + error);                        
                            res.status(500).send("Messages retrieval failed");
                        })
                        .catch(function(error) {
                            logger.error("messagesController.getSentAllPaged " + error);                        
                            res.status(500).send("Messages retrieval failed");
                        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
}

exports.getReceivedAllCount = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');
        
        messageService.getReceivedAllCount(userId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getReceivedAllCount " + error);
            res.status(500).send("Messages count failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getReceivedAllCount " + error);
            res.status(500).send("Messages count failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getReceivedAllUnread = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');
        
        messageService.getReceivedAllUnread(userId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getReceivedAllUnread " + error);
            res.status(500).send("Messages retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getReceivedAllUnread " + error);
            res.status(500).send("Messages retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getReceivedAllCount = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');
        
        messageService.getReceivedAllCount(userId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getReceivedAllCount " + error);
            res.status(500).send("Messages retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getReceivedAllCount " + error);
            res.status(500).send("Messages retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getReceivedUnreadCount = function(req, res, next) {
    if (req.user) {
        var recipientUserId = req.user._id;

        if (!recipientUserId) throw new Error('Recipient user id is missing');

        messageService.getReceivedUnreadCount(recipientUserId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getReceivedUnreadCount " + error);
            res.status(500).send("Messages retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getReceivedUnreadCount " + error);
            res.status(500).send("Messages retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getReceivedUnreadCountByUserId = function(req, res, next) {
    if (req.user) {
        var recipientUserId = req.user._id;
        var senderUserId = req.params.senderUserId;

        if (!recipientUserId) throw new Error('Recipient user id is missing');
        if (!senderUserId) throw new Error('User id is missing');    
        
        messageService.getReceivedUnreadCountByUserId(recipientUserId, senderUserId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getReceivedUnreadCountByUserId " + error);
            res.status(500).send("Messages retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getReceivedUnreadCountByUserId " + error);
            res.status(500).send("Messages retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getReceivedById = function(req, res, next) {
    if (req.user) {
        var recipientUserId = req.user._id;
        var messageId = req.params.messageId;

        if (!recipientUserId) throw new Error('Recipient user id is missing');
        if (!messageId) throw new Error('Message id is missing');   

        messageService.getReceivedById(recipientUserId, messageId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getReceivedById " + error);
            res.status(500).send("Message retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getReceivedById " + error);
            res.status(500).send("Message retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getAllUserContacts = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');

        messageService.getAllUserContacts(userId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getAllUserContacts " + error);
            res.status(500).send("Contacts retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getAllUserContacts " + error);
            res.status(500).send("Contacts retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.deleteMessage = function(req, res, next) {
    if (req.user) {
        var recipientUserId = req.user._id;
        var messageId = req.params.messageId;

        if (!recipientUserId) throw new Error('Recipient user id is missing');
        if (!messageId) throw new Error('Message id is missing');   

        messageService.deleteMessage(recipientUserId, messageId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.deleteMessage " + error);
            res.status(500).send("Message deletion failed");
        })
        .catch(function(error) {
            logger.error("messagesController.deleteMessage " + error);
            res.status(500).send("Message deletion failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.markReceivedMessagesAsRead = function(req, res, next) {
    if (req.user) {
        var recipientUserId = req.user._id;
        var messageIds = req.body.messageIds;

        if (!recipientUserId) throw new Error('Recipient user id is missing');
        if (!messageIds) throw new Error('Message ids is missing');   

        messageService.markReceivedMessagesAsRead(recipientUserId, messageIds).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.markReceivedMessagesAsRead " + error);
            res.status(500).send("Messages update failed");
        })
        .catch(function(error) {
            logger.error("messagesController.markReceivedMessagesAsRead " + error);
            res.status(500).send("Messages update failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.requestConnectionWithUser = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;
        var userIdToConnect = req.body.userIdToConnect;

        if (!userId) throw new Error('User id is missing');
        if (!userIdToConnect) throw new Error('user id to connect is missing');   

        messageService.requestConnectionWithUser(userId, userIdToConnect).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.requestConnectionWithUser " + error);
            res.status(500).send("Connection request failed");
        })
        .catch(function(error) {
            logger.error("messagesController.requestConnectionWithUser " + error);
            res.status(500).send("Connection request failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.requestConnectionsWithNearUsers = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id; 

        if (!userId) throw new Error('User id is missing');   

        messageService.requestConnectionsWithNearUsers(userId)
            .then(function(result) {
                res.status(200).json(result);
            },
            function(error) {
                logger.error("messagesController.requestConnectionsWithNearUsers " + error);
                res.status(500).send("Connections request failed");
            })
            .catch(function(error) {
                logger.error("messagesController.requestConnectionsWithNearUsers " + error);
                res.status(500).send("Connections request failed");
            });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.approveUserConnection = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;
        var pendingUserId = req.body.pendingUserId;

        if (!userId) throw new Error('User id is missing');
        if (!pendingUserId) throw new Error('user id pending is missing');   

        messageService.approveUserConnection(userId, pendingUserId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.approveUserConnection " + error);
            res.status(500).send("Connection approval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.approveUserConnection " + error);
            res.status(500).send("Connection approval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.cancelUserConnection = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;
        var cancelUserId = req.body.cancelUserId;

        if (!userId) throw new Error('User id is missing');
        if (!cancelUserId) throw new Error('user id cancel is missing');   

        messageService.cancelUserConnection(userId, cancelUserId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.cancelUserConnection " + error);
            res.status(500).send("Connection cancel failed");
        })
        .catch(function(error) {
            logger.error("messagesController.cancelUserConnection " + error);
            res.status(500).send("Connection cancel failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.getConnectedUsers = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;

        if (!userId) throw new Error('User id is missing');

        messageService.getConnectedUsers(userId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.getConnectedUsers " + error);
            res.status(500).send("Connection retrieval failed");
        })
        .catch(function(error) {
            logger.error("messagesController.getConnectedUsers " + error);
            res.status(500).send("Connection retrieval failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.sendMessage = function(req, res, next) {
    if (req.user) {
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
            res.status(500).send("Message send failed");
        })
        .catch(function(error) {
            logger.error("messagesController.sendMessage " + error);
            res.status(500).send("Message send failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.sendMessages = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;
        var recipientUserIds = req.body.recipientUserIds;
        var subject = req.body.subject;
        var messageContents = req.body.contents;

        if (!userId) throw new Error('User id is missing');
        if (!recipientUserIds || recipientUserIds.length === 0) throw new Error('Recipient user ids is missing');    
        if (!messageContents) throw new Error('Message contents is missing');    

        var sendMessageResults = [];
        for (var recipientIndex = 0; recipientIndex < recipientUserIds.length; recipientIndex++)
        {
            var recipientUserId = recipientUserIds[recipientIndex];

            sendMessageResults.push(messageService.sendMessage(userId, recipientUserId, subject, messageContents));
        }

        Promise.all(sendMessageResults).then(function(results)
                                        {
                                            res.status(200).json(results);
                                        },
                                        function(error) {
                                            logger.error("messagesController.sendMessages " + error);
                                            res.status(500).send("Message send failed");
                                        })
                                        .catch(function(error) {
                                            logger.error("messagesController.sendMessages " + error);
                                            res.status(500).send("Messages send failed");
                                        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
}

exports.muteUser = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;
        var muteUserId = req.body.muteUserId;

        if (!userId) throw new Error('User id is missing');
        if (!muteUserId) throw new Error('Mute user id is missing');  

        messageService.muteUser(userId, muteUserId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.muteUser " + error);
            res.status(500).send("User muting failed");
        })
        .catch(function(error) {
            logger.error("messagesController.muteUser " + error);
            res.status(500).send("User muting failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};

exports.unmuteUser = function(req, res, next) {
    if (req.user) {
        var userId = req.user._id;
        var unmuteUserId = req.body.unmuteUserId;

        if (!userId) throw new Error('User id is missing');
        if (!unmuteUserId) throw new Error('Unmute user id is missing');  

        messageService.unmuteUser(userId, unmuteUserId).then( function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("messagesController.unmuteUser " + error);
            res.status(500).send("User unmuting failed");
        })
        .catch(function(error) {
            logger.error("messagesController.unmuteUser " + error);
            res.status(500).send("User unmuting failed");
        });
    }
    else 
    {
        res.status(401).send('Unauthorized');
    }
};
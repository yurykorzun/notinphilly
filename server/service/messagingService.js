var lodash               = require('lodash');
var mongoose             = require('mongoose');
var promise              = require('promise');
var MessageStatusModel   = require('../api/messages/messagestatus.model');
var MessageModel         = require('../api/messages/message.model');
var UserModel            = require('../api/user/user.model');
var logger               = require('../components/logger');

exports.getAll = function(recipientUserId) {
    return new Promise(function (fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId)})
            .sort({'createdAt': 'desc'})
            .populate('from')
            .populate('to')
            .exec(function (err, messages) {
                if (err) {
                    logger.error("messageService.getAll " + err);
                }
                else fulfill(messages);
            });
    });
};

exports.getById = function(recipientUserId, messageId) {
    return new Promise(function (fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        recipientUserId = mongoose.Types.ObjectId(recipientUserId);
        messageId = mongoose.Types.ObjectId(messageId);

        MessageModel.find({ "$and": [ {to: recipientUserId}, {_id: messageId} ] })
                    .exec(function (err, message) {
                        if (err) {
                            logger.error("messageService.getAll " + err);
                        }
                        else fulfill(message);
                    });
    });
};

exports.deleteMessage = function(recipientUserId, messageId) {
    return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        recipientUserId = mongoose.Types.ObjectId(recipientUserId);
        messageId = mongoose.Types.ObjectId(messageId);

        if (!userId || !messageId) reject("User or message id is missing. Message deletion failed.");
        else
        {
            MessageModel.remove({ "$and": [ {to: recipientUserId}, {_id: messageId} ] }, function(err, message) {
                                if (err) {
                                    logger.error("messageService.deleteMessage " + err);
                                    reject("Message deletion failed");
                                } 
                                else {
                                    fulfill(message);
                                }
                            });
        }
    });
};

exports.getAllUnread = function(recipientUserId) {
     return new Promise(function (fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
         
        MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId), "read": false})
            .sort({'createdAt': 'desc'})
            .populate('from')
            .populate('to')
            .exec(function (err, messages) {
                if (err) {
                    logger.error("messageService.getAllUnread " + err);
                }
                else fulfill(messages);
            });
    });
};

exports.getUnreadCount = function(recipientUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
         
        MessageModel.count({"to": mongoose.Types.ObjectId(recipientUserId), "read": false}, function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadCount " + err);
            }
            else fulfill({unreadCount: count});
        });
     });
};

exports.getUnreadCountByUserId = function(recipientUserId, senderUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
        if (!senderUserId) reject("sender user id is missing");        
         
        MessageModel.count({"to": mongoose.Types.ObjectId(recipientUserId), "from": mongoose.Types.ObjectId(senderUserId), "read": false}, function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadCountByUserId " + err);
            }
            else fulfill({unreadCount: count});
        });
     });
};

exports.getUnreadBySenderUserIds = function(recipientUserId) {
    return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("user id is missing");

        MessageModel.aggregate(
            [
                { '$match': { "to": mongoose.Types.ObjectId(recipientUserId) } },
                { '$group': { '_id': "$to", 'count': { '$sum': 1 } } }
            ], 
        function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadBySenderUserIds " + err);
            }
            else fulfill(result);
        });
     });
};

exports.getByUserId = function(recipientUserId, senderUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
        if (!senderUserId) reject("sender user id is missing");        

        MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId), "from": mongoose.Types.ObjectId(senderUserId), "read": false})
            .sort({'createdAt': 'desc'})
            .populate('from')
            .populate('to')
            .exec(function (err, messages) {
                if (err) {
                    logger.error("messageService.getByUserId " + err);
                }
                else fulfill(messages);
            });
     });
};

exports.markMessageAsRead = function(recipientUserId, messageId)
{
      return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

         MessageModel.update({
                                "to": mongoose.Types.ObjectId(recipientUserId), 
                                "_id": mongoose.Types.ObjectId(messageId)
                            },
                            {
                                "$set": { read: true }
                            })
            .exec(function (err, result) {
                if (err) {
                    logger.error("messageService.markMessageAsRead " + err);
                }
                else fulfill(result);
            });
     });
}

exports.markMessagesAsRead = function(recipientUserId, messageIds)
{
      return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        recipientUserId = mongoose.Types.ObjectId(recipientUserId);
        messageIds = messageIds.map((id) => { return mongoose.Types.ObjectId(id); });

        MessageModel.update({
                                "to": recipientUserId, 
                                "_id": { "$in": messageIds },
                            },
                            {
                                "$set": { read: true }
                            },
                            {multi: true})
            .exec(function (err, result) {
                if (err) {
                    logger.error("messageService.markMessagesAsRead " + err);
                }
                else fulfill(result);
        });
     });
}

exports.requestConnectionWithUser = function(userId, userIdToConnect)
{
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        if (!userIdToConnect) reject("user Id to connect is missing"); 

        userId = mongoose.Types.ObjectId(userId);
        userIdToConnect = mongoose.Types.ObjectId(userIdToConnect);

        getMutedUsers(userIdToConnect).then(function(mutedUsers) {
            if (mutedUsers && mutedUsers.length > 0 && mutedUsers.indexOf(userId) > 0) 
            {
                logger.error("messageService.requestConnectionWithUser user is muted " + userId + " " + userIdToConnect);
                reject("Failed to request connection");
            }
            else
            {
                UserModel.findById(userIdToConnect, function(err, userToConnect) {
                    if (err) 
                    {
                        logger.error("messageService.requestConnectionWithUser " + err);
                    }
                    else if (!userToConnect)
                    {
                        logger.error("messageService.requestConnectionWithUser Couldn't find requested user " + userId);
                        reject("Failed to request connection");
                    }
                    else
                    {
                        if (userToConnect.connectedUsers.indexOf(userId) > 0)
                        {
                            fulfill(userToConnect);
                        }
                        else
                        {
                            if (!userToConnect.pendingConnectedUsers) userToConnect.pendingConnectedUsers = [];

                            if (userToConnect.pendingConnectedUsers.indexOf(userId) == 0)
                            {
                                userToConnect.pendingConnectedUsers.push(userId);
                                userToConnect.save(function(err, savedUser) {
                                    if (err) {
                                        logger.error("messageService.requestConnectionWithUser " + err);
                                        reject(err);
                                    } 
                                    else
                                    {
                                        fulfill(savedUser);
                                    }
                                });
                            }
                            else 
                            {
                                logger.error("messageService.requestConnectionWithUser Connection already exists for user " + userId);
                                reject("Failed to request connection");
                            }
                        }
                    }
                });
            }
        },
        function(error) {

        });
       
     });
}

exports.approveUserConnection = function(userId, pendingUserId)
{   
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        if (!pendingUserId) reject("pending user id is missing"); 

        userId = mongoose.Types.ObjectId(userId);
        pendingUserId = mongoose.Types.ObjectId(pendingUserId);

        var findUserQuery = UserModel.find({ "_id": userId });
        var findPendingUserQuery = UserModel.find({ "_id": pendingUserId });
        
        promise.all([findUserQuery, findPendingUserQuery]).then(function (results) {
            if (results.length < 2) 
            {
                logger.error("messageService.approveUserConnection couldn't approve pending user because user is missing " + userId);
                reject("Failed to approve connection");
            }
            else
            {
                var user = results[0];
                var pendingUser = results[1];

                var existingPendingUserId = lodash.find(user.pendingConnectedUsers, pendingUserId);
                var existingConnectedUserId = lodash.find(user.connectedUsers, pendingUserId);
                if (existingPendingUserId && !existingConnectedUserId)
                {
                    user.pendingConnectedUsers.reduce(existingPendingUserId);
                    user.connectedUsers.push(existingPendingUserId);

                    if (user.pendingConnectedUsers.indexOf(user._id) > 0) user.pendingConnectedUsers.reduce(user._id);
                    pendingUser.connectedUsers.push(user._id);

                    promise.all([user.save(), pendingUser.save()]).then(function(results) {
                        fulfill(results);
                    },
                    function(error) {
                        logger.error("messageService.approveUserConnection failed for user " + userId  + " " + error);
                        reject("Failed to approve connection");
                    });
                }
                else 
                {
                    logger.error("messageService.approveUserConnection failed for user " + userId);
                    reject("Failed to approve connection");
                }
            }
        },
        function(error) {
            logger.error("messageService.approveUserConnection failed for user " + userId);
            reject("Failed to approve connection");
        });
    });
}

exports.cancelUserConnection = function(userId, cancelUserId)
{
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        if (!cancelUserId) reject("cancel user Id is missing"); 

        userId = mongoose.Types.ObjectId(userId);
        cancelUserId = mongoose.Types.ObjectId(cancelUserId);

        var findUserQuery = UserModel.find({ "_id": userId });
        var findCancelUserQuery = UserModel.find({ "_id": cancelUserId });
        
        promise.all([findUserQuery, findCancelUserQuery]).then(function (results) {
            if (results.length < 2) 
            {
                logger.error("messageService.cancelUserConnection couldn't approve pending user because user is missing " + userId + " " + cancelUserId);
                reject("Failed to cancel connection");
            }
            else
            {
                var user = results[0];
                var userToCancel = results[1];

                if (user.pendingConnectedUsers.indexOf(cancelUserId) > 0) user.pendingConnectedUsers.reduce(cancelUserId);                
                if (user.connectedUsers.indexOf(cancelUserId) > 0) user.connectedUsers.reduce(cancelUserId);
                
                if (userToCancel.pendingConnectedUsers.indexOf(userId) > 0) userToCancel.pendingConnectedUsers.reduce(userId);                
                if (userToCancel.connectedUsers.indexOf(userId) > 0) userToCancel.connectedUsers.reduce(userId);

                promise.all([user.save(), userToCancel.save()]).then(function(results) {
                    fulfill(results);
                },
                function(error) {
                    logger.error("messageService.cancelUserConnection failed for user " + userId  + " " + error);
                    reject("Failed to cancel connection");
                });
            }
        },
        function(error) {
            logger.error("messageService.cancelUserConnection failed for user " + userId + " " + cancelUserId);
            reject("Failed to approve connection");
        });
    });
}

exports.getConnectedUsers = function(userId)
{
    userId = mongoose.Types.ObjectId(userId);

    return getConnectedUsers(userId);
}

exports.getMutedUsers = function(userId)
{
    userId = mongoose.Types.ObjectId(userId);
    
    return getMutedUsers(userId);
}

exports.sendMessage = function(senderUserId, recipientUserId, subject, messageContents) {
     return new Promise(function(fulfill, reject) {
        if (!senderUserId) reject("sender user id is missing");
        if (!recipientUserId) reject("recipient user Id is missing"); 

        senderUserId = mongoose.Types.ObjectId(senderUserId);
        recipientUserId = mongoose.Types.ObjectId(recipientUserId);
        
        promise.all([connectedUsers(senderUserId), getMutedUsers(recipientUserId)])
                .then(function(results) {
                    var connectedUsers = results.length > 1 ? results[0] : [];
                    var mutedUsers = results.length > 2 ? results[1] : [];
                    
                    if (connectedUsers.indexOf(recipientUserId) > 0 && mutedUsers.indexOf(senderUserId) == 0)
                    {
                        var Message = mongoose.model('Message');
                        var newMessage = new Message({
                            from: senderUserId,
                            to: recipientUserId,
                            subject: subject,
                            contents: messageContents
                        });

                        newMessage.save(function(err, savedMessage) {
                            if (err) {
                                logger.error("messageService.sendMessage " + err);
                                reject(err);
                            } 
                            else
                            {
                                fulfill(savedMessage);
                            }
                        });
                    }
                    else
                    {
                        logger.error("messageService.sendMessage failed no connection or muted for user " + senderUserId + " " + recipientUserId);
                        reject("Failed to sendMessage");
                    }
                },
                function(error) {
                    logger.error("messageService.sendMessage failed for user " + userId  + " " + error);
                    reject("Failed to sendMessage");
                });
    });
};

exports.muteUser = function(userId, muteUserId) {
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        if (!muteUserId) reject("mute user Id is missing"); 

        userId = mongoose.Types.ObjectId(userId);
        muteUserId = mongoose.Types.ObjectId(muteUserId);

        var findUserQuery = UserModel.find({ "_id": userId });
        var findMutedUserQuery = UserModel.find({ "_id": muteUserId });

        promise.all([findUserQuery, findMutedUserQuery]).then(function (results) {
            if (results.length < 2) 
            {
                logger.error("messageService.muteUser couldn't approve pending user because user is missing " + userId + " " + muteUserId);
                reject("Failed to mute user");
            }
            else
            {
                var user = results[0];
                var userToMute = results[1];

                if (user.pendingConnectedUsers.indexOf(muteUserId) > 0) user.pendingConnectedUsers.reduce(muteUserId);
                if (user.connectedUsers.indexOf(muteUserId) > 0) user.connectedUsers.reduce(muteUserId);
                if (user.mutedUsers.indexOf(muteUserId) == 0) user.mutedUsers.push(muteUserId);

                if (userToMute.pendingConnectedUsers.indexOf(userId) > 0) userToMute.pendingConnectedUsers.reduce(userId);
                if (userToMute.connectedUsers.indexOf(userId) > 0) userToMute.connectedUsers.reduce(userId);

                promise.all([user.save(), userToMute.save()]).then(function(results) {
                    fulfill(results);
                },
                function(error) {
                    logger.error("messageService.muteUser failed for user " + userId  + " " + muteUserId + " " + error);
                    reject("Failed to mute user");
                });
            }
        },
        function(error) {
            logger.error("messageService.muteUser failed for user " + userId  + " " + muteUserId);
            reject("Failed to mute user");
        });
     });
};

exports.unmuteUser = function(userId, unmuteUserId) {
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        if (!unmuteUserId) reject("unmute user id is missing"); 

        userId = mongoose.Types.ObjectId(userId);
        unmuteUserId = mongoose.Types.ObjectId(unmuteUserId);

        var findUserQuery = UserModel.find({ "_id": userId });
        var findUnmutedUserQuery = UserModel.find({ "_id": unmuteUserId });

        promise.all([findUserQuery, findUnmutedUserQuery]).then(function (results) {
            if (results.length < 2) 
            {
                logger.error("messageService.unmuteUser couldn't approve pending user because user is missing " + userId + " " + unmuteUserId);
                reject("Failed to unmute user");
            }
            else
            {
                var user = results[0];
                var userToUnmute = results[1];

                if (user.mutedUsers.indexOf(unmuteUserId) == 0) user.mutedUsers.reduce(unmuteUserId);

                user.save(function(err, savedUser) {
                    if (err) {
                        logger.error("messageService.unmuteUser " + err);
                        reject(err);
                    } 
                    else
                    {
                        fulfill(savedUser);
                    }
                });
            }
        },
        function(error) {
            logger.error("messageService.unmuteUser failed for user " + userId  + " " + muteUserId);
            reject("Failed to unmute user");
        });
    });
};

var getConnectedUsers = function(userId) {
     return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");

        var userQuery = UserModel.findById(userId);
        userQuery.populate('connectedUsers').exec(function(err, user) { 
            if (err) {
                logger.error("messageService.getConnectedUsers failed for user " + userId + " " + err);
                reject("Failed to retrieve connections");
            }
            else
            {
                fulfill(user.connectedUsers);
            }
        });
    });
}

var getMutedUsers = function(userId) {
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        
        var userQuery = UserModel.findById(userId);
        userQuery.populate('mutedUsers').exec(function(err, user) { 
            if (err) {
                logger.error("messageService.getMutedUsers failed for user " + userId + " " + err);
                reject("Failed to retrieve muted");
            }
            else
            {
                fulfill(user.mutedUsers);
            }
        });
    });
}

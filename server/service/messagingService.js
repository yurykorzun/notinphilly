var lodash               = require('lodash');
var mongoose             = require('mongoose');
var MessageStatusModel   = require('../api/messages/messagestatus.model');
var MessageModel         = require('../api/messages/message.model');
var UserModel            = require('../api/user/user.model');
var logger               = require('../components/logger');

exports.getAll = function(recepientUserId) {
    return new Promise(function (fulfill, reject) {
        MessageModel.find({"to": mongoose.Types.ObjectId(recepientUserId)})
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

exports.getAllUnread = function(recepientUserId) {
     return new Promise(function (fulfill, reject) {
        MessageModel.find({"to": mongoose.Types.ObjectId(recepientUserId), "read": false})
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

exports.getUnreadCount = function(recepientUserId) {
     return new Promise(function(fulfill, reject) {
        MessageModel.count({"to": mongoose.Types.ObjectId(recepientUserId), "read": false}, function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadCount " + err);
            }
            else fulfill({unreadCount: count});
        });
     });
};

exports.getUnreadCountByUserId = function(recepientUserId, senderUserId) {
     return new Promise(function(fulfill, reject) {
        MessageModel.count({"to": mongoose.Types.ObjectId(recepientUserId), "from": mongoose.Types.ObjectId(senderUserId), "read": false}, function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadCountByUserId " + err);
            }
            else fulfill({unreadCount: count});
        });
     });
};

exports.getUnreadBySenderUserIds = function(recepientUserId) {
    return new Promise(function(fulfill, reject) {
        MessageModel.aggregate(
            [
                { '$match': { "to": mongoose.Types.ObjectId(recepientUserId) } },
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

exports.getByUserId = function(recepientUserId, senderUserId) {
     return new Promise(function(fulfill, reject) {
         MessageModel.find({"to": mongoose.Types.ObjectId(recepientUserId), "from": mongoose.Types.ObjectId(senderUserId), "read": false})
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

exports.markMessageAsRead = function(recepientUserId, messageId)
{
      return new Promise(function(fulfill, reject) {
         MessageModel.update({
                                "to": mongoose.Types.ObjectId(recepientUserId), 
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

exports.markMessagesAsRead = function(recepientUserId, messageIds)
{
      return new Promise(function(fulfill, reject) {
         MessageModel.update({
                                "to": mongoose.Types.ObjectId(recepientUserId), 
                                "_id": { "$in": messageIds},
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
        UserModel.find({ "_id": mongoose.Types.ObjectId(userIdToConnect) }, function(err, userToConnect) {
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
                if (!userToConnect.pendingConnectedUsers) userToConnect.pendingConnectedUsers = [];

                if (userToConnect.pendingConnectedUsers.indexOf(mongoose.Types.ObjectId(userId) == 0))
                {
                    userToConnect.pendingConnectedUsers.push(mongoose.Types.ObjectId(userId));
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
        });
     });
}

exports.approveUserConnection = function(userId, pendingUserId)
{   
    return new Promise(function(fulfill, reject) {
        UserModel.find({ "_id": mongoose.Types.ObjectId(userId) }, function(err, user) {
            if (err) 
            {
                logger.error("messageService.approveUserConnection " + err);
            }
            else if (!user)
            {
                logger.error("messageService.approveUserConnection Couldn't find requested user " + userId);
                reject("Failed to approve connection");
            }
            else if (user.pendingConnectedUsers && user.pendingConnectedUsers.length > 0)
            {
                var pendingUserId = lodash.find(user.pendingConnectedUsers, mongoose.Types.ObjectId(pendingUserId));
                var connectedUserId = lodash.find(user.connectedUsers, mongoose.Types.ObjectId(pendingUserId));
                if (pendingUserId && !connectedUserId)
                {
                    if (!user.connectedUsers) user.connectedUsers = [];

                    user.pendingConnectedUsers.reduce(pendingUserId);
                    user.connectedUsers.push(pendingUserId);                    
                    user.save(function(err, savedUser) {
                        if (err) {
                            logger.error("messageService.approveUserConnection " + err);
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
                    logger.error("messageService.approveUserConnection failed for user " + userId);
                    reject("Failed to approve connection");
                }
            }
            else
            {
                logger.error("messageService.approveUserConnection failed for user " + userId);
                reject("Failed to approve connection");
            }
        });
    });
}

exports.cancelUserConnection = function(userId, cancelUserId)
{
    return new Promise(function(fulfill, reject) {
        UserModel.find({ "_id": mongoose.Types.ObjectId(userId) }, function(err, user) {
            if (err) 
            {
                logger.error("messageService.cancelUserConnection " + err);
            }
            else if (!user)
            {
                logger.error("messageService.cancelUserConnection Couldn't find requested user " + userId);
                reject("Failed to cancel connection");
            }
            else if (user.pendingConnectedUsers)
            {
                var pendingUserId = lodash.find(user.pendingConnectedUsers, mongoose.Types.ObjectId(pendingUserId));
                if (pendingUserId)
                {
                    user.pendingConnectedUsers.reduce(pendingUserId);                
                    user.save(function(err, savedUser) {
                        if (err) {
                            logger.error("messageService.cancelUserConnection " + err);
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
                    logger.error("messageService.cancelUserConnection pending user missing for user " + userId);
                    reject("Failed to request connection");
                }
            }
        });
    });
}

exports.getConnectedUsers = function(userId)
{
     return getConnectedUsers(userId);
}

exports.sendMessage = function(senderUserId, recepientUserId, subject, messageContents) {
     return new Promise(function(fulfill, reject) {
        getConnectedUsers(senderUserId).then(function(users) {
            if (users)
            {
                var connectedUser = lodash.find(users, {"_id": mongoose.Types.ObjectId(recepientUserId) });
                if (connectedUserId)
                {
                     var Message = mongoose.model('Message');
                     var newMessage = new Message({
                         from: mongoose.Types.ObjectId(senderUserId),
                         to: mongoose.Types.ObjectId(recepientUserId),
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
            }
        }, 
        function(error) {

        });
     });
};

exports.muteUser = function(userId, muteUserId) {
 
};

exports.unmuteUser = function(userId, unmuteUserId) {
 
};

exports.deleteMessage = function(userId, messageId) {
 
};

var getConnectedUsers = function(userId)
{
     return new Promise(function(fulfill, reject) {
        UserModel.find({ "neighborhoods": { "$elemMatch": { "$eq": mongoose.Types.ObjectId(userId) } } }, function(err, users) {
            if (err) 
            {
                logger.error("messageService.getConnectedUsers " + err);
            }
            else
            {
                fulfill(users);
            }
        });
     });
}
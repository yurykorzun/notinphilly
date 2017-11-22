var lodash               = require('lodash');
var mongoose             = require('mongoose');
var promise              = require('promise');
var emailService         = require('./emailService');
var userService          = require('./userService');
var MessageStatusModel   = require('../api/messages/messagestatus.model');
var MessageModel         = require('../api/messages/message.model');
var UserModel            = require('../api/user/user.model');
var logger               = require('../components/logger');

exports.getReceivedAll = function(recipientUserId) {
    return new Promise(function (fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId)})
            .sort({'createdAt': 'desc'})
            .populate('from', '_id email firstName lastName adoptedStreets fullName' )
            .populate('to', '_id email firstName lastName adoptedStreets fullName' )
            .exec(function (err, messages) {
                if (err) {
                    logger.error("messageService.getReceivedAll " + err);
                    reject("Failed retrieving messages");
                }
                else fulfill(messages);
            });
    });
};

exports.getReceivedAllPaged = function(recipientUserId, skip, limit) {
    return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        MessageModel.count({"to": mongoose.Types.ObjectId(recipientUserId)}, function(err, count) {
            if (err) {
                logger.error("messageService.getReceivedAllPaged " + err);
                reject("Failed retrieving messages");
            }
            else
            {
                var query = MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId)});

                if (skip) query = query.skip(skip);
                if (limit) query = query.limit(limit);

                query.sort({'createdAt': 'desc'})
                    .populate('from', '_id email firstName lastName adoptedStreets fullName' )
                    .populate('to', '_id email firstName lastName adoptedStreets fullName' )
                    .exec(function (err, messages) {
                        if (err) {
                            logger.error("messageService.getReceivedAllPaged " + err);
                            reject("Failed retrieving messages");
                        }
                        else {
                            var totalMessagesBeforeNext = skip + limit;

                            fulfill({ 
                                messages: messages, 
                                totalCount: count,
                                hasMore: totalMessagesBeforeNext < count
                            });
                        }
                    });
            }
        });
    });
}

exports.getSentAllPaged = function(senderUserId, skip, limit) {
    return new Promise(function(fulfill, reject) {
        if (!senderUserId) reject("sender user id is missing");

        MessageModel.count({"from": mongoose.Types.ObjectId(senderUserId)}, function(err, count) {
            if (err) {
                logger.error("messageService.getSentAllPaged " + err);
                reject("Failed retrieving messages");
            }
            else
            {
                var query = MessageModel.find({"from": mongoose.Types.ObjectId(senderUserId)});

                if (skip) query = query.skip(skip);
                if (limit) query = query.limit(limit);

                query.sort({'createdAt': 'desc'})
                    .populate('from', '_id email firstName lastName adoptedStreets fullName' )
                    .populate('to', '_id email firstName lastName adoptedStreets fullName' )
                    .exec(function (err, messages) {
                        if (err) {
                            logger.error("messageService.getSentAllPaged " + err);
                            reject("Failed retrieving messages");
                        }
                        else {
                            var totalMessagesBeforeNextPage = skip + limit;

                            fulfill({ 
                                messages: messages, 
                                totalCount: count,
                                hasMore: totalMessagesBeforeNextPage < count
                            });
                        }
                    });
            }
        });
    });
}

exports.getReceivedById = function(recipientUserId, messageId) {
    return new Promise(function (fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");

        recipientUserId = mongoose.Types.ObjectId(recipientUserId);
        messageId = mongoose.Types.ObjectId(messageId);

        MessageModel.find({ "$and": [ {to: recipientUserId}, {_id: messageId} ] })
                    .exec(function (err, message) {
                        if (err) {
                            logger.error("messageService.getReceivedById " + err);
                            reject("Failed retrieving a message");
                        }
                        else fulfill(message);
                    });
    });
};

exports.getAllUserContacts = function(userId) {
    return new Promise(function (fulfill, reject) {
        if (!userId) reject("user id is missing");

        userId = mongoose.Types.ObjectId(userId);

        UserModel.findById(userId)
                    .populate("pendingConnectedUsers", '_id email firstName lastName adoptedStreets fullName' )
                    .populate("connectedUsers", '_id email firstName lastName adoptedStreets fullName' )
                    .populate("connectedUsers", '_id email firstName lastName adoptedStreets fullName' )                   
                    .populate("mutedUsers")    
                    .select('-salt -hashedPassword -_v -authToken -__v -fullAddress -addressLocation -apartmentNumber -streetNumber -streetName')                
                    .exec(function (err, user) {
                        if (err) {
                            logger.error("messageService.getAllUserContacts " + err);
                            reject("Failed retrieving contacts");                            
                        }
                        else
                        {
                            UserModel.count({pendingConnectedUsers: {'$elemMatch': { '$eq' : userId }}},  function(err, count) {
                                if (err) {
                                    logger.error("messageService.getAllUserContacts " + err);
                                    reject("Failed retrieving contacts");                            
                                }
                                else
                                {
                                    var response = {
                                        connectedUsers: user.connectedUsers,
                                        pendingUsers: user.pendingConnectedUsers,
                                        mutedUsers: user.mutedUsers,
                                        pendingSentRequests: count
                                    };
                                    
                                    fulfill(response);
                                }
                            });
                        }
                    });
    });
};


exports.deleteMessage = function(userId, messageId) {
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("recipient user id is missing");

        userId = mongoose.Types.ObjectId(userId);
        messageId = mongoose.Types.ObjectId(messageId);

        if (!userId || !messageId) reject("User or message id is missing. Message deletion failed.");
        else
        {
            MessageModel.remove({ "$and": [ { "$or": [{to: userId}, {from: userId} ] }, {_id: messageId} ] }, 
                                function(err, message) {
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

exports.getReceivedAllUnread = function(recipientUserId) {
     return new Promise(function (fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
         
        MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId), "read": false})
            .sort({'createdAt': 'desc'})
            .populate('from', '_id email firstName lastName adoptedStreets fullName' ) 
            .populate('to', '_id email firstName lastName adoptedStreets fullName' ) 
            .exec(function (err, messages) {
                if (err) {
                    logger.error("messageService.getReceivedAllUnread " + err);
                    reject("Messages retrieval failed");
                }
                else fulfill(messages);
            });
    });
};

exports.getReceivedAllCount = function(recipientUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
         
        MessageModel.count({"to": mongoose.Types.ObjectId(recipientUserId)}, function(err, count) {
            if (err) {
                logger.error("messageService.getReceivedAllCount " + err);
                reject("Messages count failed");
            }
            else fulfill({totalCount: count});
        });
     });
};

exports.getReceivedUnreadCount = function(recipientUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
         
        MessageModel.count({"to": mongoose.Types.ObjectId(recipientUserId), "read": false}, 
                    function(err, count) {
                        if (err) {
                            logger.error("messageService.getReceivedUnreadCount " + err);
                            reject("Messages count failed");
                        }
                        else fulfill({unreadCount: count});
                    });
     });
};

exports.getReceivedUnreadCountByUserId = function(recipientUserId, senderUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
        if (!senderUserId) reject("sender user id is missing");        
         
        MessageModel.count({"to": mongoose.Types.ObjectId(recipientUserId), "from": mongoose.Types.ObjectId(senderUserId), "read": false}, 
                    function(err, count) {
                        if (err) {
                            logger.error("messageService.getReceivedUnreadCountByUserId " + err);
                            reject("Messages count failed");                            
                        }
                        else fulfill({unreadCount: count});
                    });
     });
};

exports.getReceivedUnreadBySenderUserIds = function(recipientUserId) {
    return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("user id is missing");

        MessageModel.aggregate(
            [
                { '$match': { "to": mongoose.Types.ObjectId(recipientUserId) } },
                { '$group': { '_id': "$to", 'count': { '$sum': 1 } } }
            ], 
        function(err, count) {
            if (err) {
                logger.error("messageService.getReceivedUnreadBySenderUserIds " + err);
                reject("Messages count failed");                            
            }
            else fulfill(result);
        });
     });
};

exports.getReceivedByUserId = function(recipientUserId, senderUserId) {
     return new Promise(function(fulfill, reject) {
        if (!recipientUserId) reject("recipient user id is missing");
        if (!senderUserId) reject("sender user id is missing");        

        MessageModel.find({"to": mongoose.Types.ObjectId(recipientUserId), "from": mongoose.Types.ObjectId(senderUserId), "read": false})
            .sort({'createdAt': 'desc'})
            .populate('from', '_id email firstName lastName adoptedStreets fullName' ) 
            .populate('to', '_id email firstName lastName adoptedStreets fullName' ) 
            .exec(function (err, messages) {
                if (err) {
                    logger.error("messageService.getReceivedByUserId " + err);
                    reject("Message retrieval failed");                            
                }
                else fulfill(messages);
            });
     });
};

exports.markReceivedMessageAsRead = function(recipientUserId, messageId)
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
                    logger.error("messageService.markReceivedMessageAsRead " + err);
                    reject("Message update failed");                                                
                }
                else fulfill(result);
            });
     });
}

exports.markReceivedMessagesAsRead = function(recipientUserId, messageIds)
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
                    logger.error("messageService.markReceivedMessagesAsRead " + err);
                    reject("Messages update failed");                                                                    
                }
                else fulfill(result);
        });
     });
}

exports.requestConnectionWithUser = function(userId, userIdToConnect)
{
    return requestConnectionWithUser(userId, userIdToConnect);
}

exports.requestConnectionsWithNearUsers = function(userId)
{
    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        
        userService.findNearUser(userId).then(function(users) {
            for (var i = 0; i < users.length; i++) {
                var userToConnect = users[i];

                requestConnectionWithUser(userId, userToConnect._id)
                    .then(function(result){
                        fulfill(result);
                    },
                    function(error) {
                        logger.error("messageService.requestConnectionsWithNearUsers failed requesting connections " + error);
                        reject("Failed to request connections");
                    })
                    .catch(function(error) {
                        logger.error("messageService.requestConnectionsWithNearUsers failed requesting connections " + error);
                        reject("Failed to request connections");
                    });
            }
        },
        function(error) {
            logger.error("messageService.requestConnectionsWithNearUsers failed requesting connections " + error);
            reject("Failed to request connections");
        })
        .catch(function(error) {
            logger.error("messageService.requestConnectionsWithNearUsers failed requesting connections " + error);
            reject("Failed to request connections");
        });
    });
}

exports.requestConnectionWithUsersByStreetId = function(userId, streetId)
{
    return new Promise(function(fulfill, reject) {
        return userService.getUsersByStreetId(streetId)
                            .then(function(users) {
                                for (var i = 0; i < users.length; i++)
                                {
                                    requestConnectionWithUser(userId, users[i]._id);
                                }
                                
                                fulfill(users);
                            },
                            function(error) {
                                logger.error("messageService.requestConnectionWithUsersByStreetId failed requesting connections " + error);
                                reject("Failed to request connections");
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
                var user = lodash.first(lodash.first(results));
                var pendingUser = lodash.first(results[1]);

                var existingPendingUserId = lodash.find(user.pendingConnectedUsers, pendingUserId);
                var existingConnectedUserId = lodash.find(user.connectedUsers, pendingUserId);
                if (existingPendingUserId && !existingConnectedUserId)
                {
                    user.pendingConnectedUsers.pull(existingPendingUserId);
                    user.connectedUsers.push(existingPendingUserId);

                    if (pendingUser.pendingConnectedUsers.indexOf(user._id) > -1) pendingUser.pendingConnectedUsers.pull(user._id);
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
        })
        .catch(function(error) {
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
                var user = lodash.first(lodash.first(results));
                var userToCancel = lodash.first(results[1]);

                if (user.pendingConnectedUsers.indexOf(cancelUserId) > -1) user.pendingConnectedUsers.pull(cancelUserId);                
                if (user.connectedUsers.indexOf(cancelUserId) > -1) user.connectedUsers.pull(cancelUserId);
                
                if (userToCancel.pendingConnectedUsers.indexOf(userId) > -1) userToCancel.pendingConnectedUsers.pull(userId);                
                if (userToCancel.connectedUsers.indexOf(userId) > -1) userToCancel.connectedUsers.pull(userId);

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
        })
        .catch(function(error) {
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
        
        promise.all([getConnectedUsers(senderUserId), getMutedUsers(recipientUserId)])
                .then(function(results) {
                    var connectedUsers = results.length >= 1  ? lodash.first(results) : [];
                    var mutedUsers = results.length >= 2 ? results[1] : [];             
                    
                    var connectedUserIndex = lodash.findIndex(connectedUsers, function(user) { return user._id.toString() === recipientUserId.toString(); });
                    var mutedUserIndex = lodash.findIndex(mutedUsers, function(user) { return user._id.toString() === senderUserId.toString(); });                    

                    if (connectedUserIndex > -1
                        && lodash.findIndex(mutedUsers, function(user) { return user._id === senderUserId }) === -1)
                    {
                        var Message = mongoose.model('Message');
                        var newMessage = new Message({
                            from: senderUserId,
                            to: recipientUserId,
                            subject: subject,
                            contents: messageContents,
                            read: false
                        });
                        
        
                        promise.all([UserModel.findById(senderUserId).populate("neighborhood"), 
                                     UserModel.findById(recipientUserId)])
                                .then(function(results) {
                                    var senderUser = lodash.first(results);
                                    var recipientUser = results[1];       

                                    newMessage.save(function(err, savedMessage) {
                                        if (err) {
                                            logger.error("messageService.sendMessage " + err);
                                            reject(err);
                                        } 
                                        else
                                        {
                                            emailService.sendUserRecievedMessage(recipientUser.email, 
                                                                                recipientUser.firstName, 
                                                                                senderUser.fullName, 
                                                                                senderUser.neighborhood ? senderUser.neighborhood.name : undefined);
                                            
                                            fulfill(savedMessage);
                                        }
                                    });
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
                })
                .catch(function(error) {
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
                var user = lodash.first(lodash.first(results));
                var userToMute = lodash.first(results[1]);

                if (user.pendingConnectedUsers.indexOf(muteUserId) > -1) user.pendingConnectedUsers.pull(muteUserId);
                if (user.connectedUsers.indexOf(muteUserId) > -1) user.connectedUsers.pull(muteUserId);
                if (user.mutedUsers.indexOf(muteUserId) === -1) user.mutedUsers.push(muteUserId);

                if (userToMute.pendingConnectedUsers.indexOf(userId) > -1) userToMute.pendingConnectedUsers.pull(userId);
                if (userToMute.connectedUsers.indexOf(userId) > -1) userToMute.connectedUsers.pull(userId);

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
        })
        .catch(function(error) {
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
                var user = lodash.first(lodash.first(results));
                var userToUnmute = lodash.first(results[1]);

                if (user.mutedUsers.indexOf(unmuteUserId) === -1) user.mutedUsers.pull(unmuteUserId);
                if (user.pendingConnectedUsers.indexOf(unmuteUserId) === -1) user.pendingConnectedUsers.push(unmuteUserId);

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
        })
        .catch(function(error) {
            logger.error("messageService.unmuteUser failed for user " + userId  + " " + muteUserId);
            reject("Failed to unmute user");
        });
    });
};

var requestConnectionWithUser = function(userId, userIdToConnect)
{
    if (userId.toString() === userIdToConnect.toString()) return;

    return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");
        if (!userIdToConnect) reject("user Id to connect is missing"); 

        userId = mongoose.Types.ObjectId(userId);
        userIdToConnect = mongoose.Types.ObjectId(userIdToConnect);

        getMutedUsers(userIdToConnect).then(function(mutedUsers) {
            if (mutedUsers && mutedUsers.length > -1 && lodash.findIndex(mutedUsers, function(mutedUser) { return mutedUser._id.equals(userId) } ) > -1) 
            {
                logger.error("messageService.requestConnectionWithUser user is muted " + userId + " " + userIdToConnect);
                fulfill({});
            }
            else
            {
                UserModel.findById(userIdToConnect)
                        .exec(function(err, userToConnect) 
                        {
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
                                    if (userToConnect.connectedUsers.indexOf(userId) > -1)
                                    {
                                        fulfill(userToConnect);
                                    }
                                    else
                                    {
                                        if (!userToConnect.pendingConnectedUsers) userToConnect.pendingConnectedUsers = [];

                                        if (userToConnect.pendingConnectedUsers.indexOf(userId) === -1)
                                        {
                                            userToConnect.pendingConnectedUsers.push(userId);
                                            userToConnect.save(function(err, savedUser) {
                                                if (err) {
                                                    logger.error("messageService.requestConnectionWithUser " + err);
                                                    reject(err);
                                                } 
                                                else
                                                {
                                                    UserModel.findById(userId)
                                                            .populate("neighborhood")
                                                            .exec(function(err, user) 
                                                            {
                                                                user.sentConnectionRequests = true;
                                                                user.save(function(err, sender) {
                                                                    emailService.sendUserConnectionRequest(savedUser.email, 
                                                                        savedUser.firstName, 
                                                                        sender.fullName, 
                                                                        sender.neighborhood ? sender.neighborhood.name : undefined);
                                                                });
                                                               
                                                            });

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
            logger.error("messageService.requestConnectionWithUser failed requesting a connection " + error);
            reject("Failed to request connection");
        })
        .catch(function(error) {
            throw Error(error);
        });
       
     });
}

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

var getPendingUsers = function(userId) {
     return new Promise(function(fulfill, reject) {
        if (!userId) reject("user id is missing");

        var userQuery = UserModel.findById(userId);
        userQuery.populate('pendingConnectedUsers').exec(function(err, user) { 
            if (err) {
                logger.error("messageService.getPendingUsers failed for user " + userId + " " + err);
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

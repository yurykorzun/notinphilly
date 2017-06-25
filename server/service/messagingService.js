var mongoose             = require('mongoose');
var MessageStatusModel   = require('../api/messaging/messagestatus.model');
var MessageModel         = require('../api/messaging/message.model');
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

exports.getUnreadCount = function(toUserId) {
     return new Promise(function(fulfill, reject) {
        MessageModel.count({"to": mongoose.Types.ObjectId(toUserId), "read": false}, function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadCount " + err);
            }
            else fulfill({unreadCount: count});
        });
     });
};

exports.getUnreadCountByUserId = function(toUserId, fromUserId) {
     return new Promise(function(fulfill, reject) {
        MessageModel.count({"to": mongoose.Types.ObjectId(toUserId), "from": mongoose.Types.ObjectId(fromUserId), "read": false}, function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadCount " + err);
            }
            else fulfill({unreadCount: count});
        });
     });
};

exports.getUnreadUserIds = function(toUserId) {
    return new Promise(function(fulfill, reject) {
        MessageModel.aggregate(
            [
                { '$match': { "to": mongoose.Types.ObjectId(toUserId) } },
                { '$group': { '_id': "$to", 'count': { '$sum': 1 } } }
            ], 
        function(err, count) {
            if (err) {
                logger.error("messageService.getUnreadUserIds " + err);
            }
            else fulfill(result);
        });
     });
};

exports.getByUserId = function(toUserId, fromUserId) {
     return new Promise(function(fulfill, reject) {
         MessageModel.find({"to": mongoose.Types.ObjectId(toUserId), "from": mongoose.Types.ObjectId(fromUserId), "read": false})
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

exports.markMessageAsRead = function(toUserId, messageId)
{
      return new Promise(function(fulfill, reject) {
         MessageModel.update({
                                "to": mongoose.Types.ObjectId(toUserId), 
                                "_id": mongoose.Types.ObjectId(messageId)
                            },
                            {
                                "$set": { read: true }
                            })
            .exec(function (err, result) {
                if (err) {
                    logger.error("messageService.getByUserId " + err);
                }
                else fulfill(result);
            });
     });
}

exports.markMessagesAsRead = function(toUserId, messageIds)
{
      return new Promise(function(fulfill, reject) {
         MessageModel.update({
                                "to": mongoose.Types.ObjectId(toUserId), 
                                "_id": { "$in": messageIds},
                            },
                            {
                                "$set": { read: true }
                            },
                            {multi: true})
            .exec(function (err, result) {
                if (err) {
                    logger.error("messageService.getByUserId " + err);
                }
                else fulfill(result);
            });
     });
}

exports.requestUserConnection = function(userId, connectionUserId)
{

}

exports.approveUserConnection = function(userId, connectionUserId)
{

}

exports.cancelUserConnection = function(userId, connectionUserId)
{

}

exports.muteUser = function(userId, muteUserId) {
 
};

exports.unmuteUser = function(userId, unmuteUserId) {
 
};

exports.deleteMessage = function(userId, messageId) {
 
};
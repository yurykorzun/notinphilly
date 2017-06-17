var mongoose        = require('mongoose');
var json2csv        = require('json2csv');
var userService     = require('../../service/userService');

var UserModel           = require('./user.model');
var StateModel          = require('../state/state.model');
var StreetModel         = require('../street/street.model');
var NeighborhoodModel = require('../neighborhood/neighborhood.model');
var toolRequestController = require('../toolRequests/toolRequest.controller');
var apiSettings         = require('../../config/apiSettings');
var mailgun             = require('mailgun-js')({ apiKey: apiSettings.EMAIL_API_KEY, domain: apiSettings.EMAIL_DOMAIN });
var logger              = require('../../components/logger');

exports.index = function(req, res) {
    userService.getAll().then(
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("usercontroller.index " + error);
            res.status(500).send(err);
        });
};


exports.me = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('User id is missing');

    userService.getUserById(userId, true).then(
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("usercontroller.me " + error);            
            res.status(500).send(error);
        });
};

exports.getAllPaged = function(req, res) {
    var page = req.params.pageNumber;
    var pageSize = req.params.pageSize;
    var sortColumn = req.params.sortColumn;
    var sortDirection = req.params.sortDirection;

    var limit = parseInt(pageSize);
    var itemsToSkip = (page - 1) * limit;

    userService.getAllPagedSorted(sortColumn, sortDirection, itemsToSkip, limit).then(
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("usercontroller.getAllPaged " + error);                        
            res.status(500).send(error);
        });
};


exports.exportUsersCSV = function(req, res) {
    var sortColumn = req.params.sortColumn;
    var sortDirection = req.params.sortDirection;

    userService.getAllSorted(sortColumn, sortDirection).then(
        function(result) {
            var users = result.users;
            var userList = new Array();
            for (var i = 0; i < users.length; i++) {
                var user = users[i].toObject();
                userList.push({
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "address": user.address,
                    "neighborhood": user.neighborhood ? user.neighborhood.name : undefined,
                    "zip": user.zip,
                    "email": user.email,
                    "businessName": user.businessName,
                    "phoneNumber": user.phoneNumber,
                    "createdAt": user.createdAt,
                    "isDistributer": user.isDistributer,
                    "isAdmin": user.isAdmin,
                    "active": user.active
                });
            }

            var csv = json2csv({ data: userList });

            res.attachment('userExport.csv');
            res.status(200).send(csv);
        },
        function(error) {
            logger.error("usercontroller.exportUsersCSV " + error);                                    
            res.status(500).send(error);
        });
};

exports.create = function(req, res, next) {
    var user = req.body;

    userService.create(user, true, false).then(
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("usercontroller.create " + error);                                                
            res.status(500).send(error);
        });
};

exports.update = function(req, res) {
    var userId = req.body._id.toString();
    var currentUserId = req.user._id.toString();


    if (!userId) return res.status(500).send("User id is missing. Update failed.");
    else if (userId != currentUserId && !req.user.isAdmin) return res.status(401).send("Unauthorized");

    var user = req.body;
    userService.update(user).then(
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error("usercontroller.update " + error);                                                            
            res.status(500).send(error);
        });
};

exports.changePassword = function(req, res, next) {
    if (req.isAuthenticated() && req.user) {
        var userId = req.user._id;
        if (!userId) return res.status(401).send('Unauthorized');

        var oldPass = req.body.oldPassword;
        var newPass = req.body.newPassword;

        userService.changePassword(userId, oldPass, newPass).then(
            function(result) {
                res.status(200).send('Successfully changed password');
            },
            function(error) {
                logger.error('usercontroller.changePassword ' + error);                                                                            
                res.status(403).send('Password change failed');
            });
    } else {
        logger.error('usercontroller.changePassword Password change is forbidden');                                                            
        res.status(403).send('Password change is forbidden');
    }
};

exports.resetPassword = function(req, res, next) {
    var userEmail = req.body.email;

    userService.resetPassword(userEmail).then(
        function(result) {
            res.status(200).send('Successfully completed password reset');
        },
        function(error) {
            logger.error('usercontroller.resetPassword ' + error);                                                                        
            res.status(500).send('There was an issue. Please try again later');
        });
};


exports.get = function(req, res, next) {
    var userId = req.params.id;
    var currentUserId = req.user._id.toString();

    if (!userId) return res.status(500).send("User id is missing. Update failed.");
    else if (userId != currentUserId && !req.user.isAdmin) return res.status(401).send("Unauthorized");

    userService.getUserById(userId, true).then(
        function(result) {
            res.status(200).json(result);
        },
        function(error) {
            logger.error('usercontroller.get ' + error);                                                                                    
            res.status(500).send(err);
        });
};

exports.destroy = function(req, res) {
    var userId = req.params.id;
    var currentUserId = req.user._id.toString();

    if (!userId) return res.status(500).send("User id is missing. Update failed.");
    else if (userId != currentUserId && !req.user.isAdmin) return res.status(401).send("Unauthorized");

    userService.delete(userId).then(
        function(userId) {
            toolRequestController.removeForUser(userId);
            res.status(200).json(userId);
        },
        function(error) {
            logger.error('usercontroller.destroy ' + error);                                                                                                
            res.status(500).send(err);
        });
};


exports.activate = function(req, res) {
    var confirmId = req.params.activationId;

    userService.activate(confirmId).then(
        function(result) {
            res.statusCode = 302;
            res.setHeader("Location", "/public/pages/confirm-account.html");
            res.end();
        },
        function(error) {
            logger.error('usercontroller.activate ' + error);                                                                                                            
            res.status(500).send(err);
        });
};
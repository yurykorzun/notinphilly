var mongoose            = require('mongoose');
var ToolRequestModel    = require('./toolRequest.model');
var RequestStatusModel  = require('./requestStatus.model');
var ToolsInventoryModel = require('../inventory/toolsInventory.model');
var UserModel           = require('../user/user.model');

var stateConsts = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  DELIVERED: 3
};

exports.get = function(req, res, next) {
  ToolRequestModel.find({})
          .populate('user')
          .populate('tool')
          .populate('status')
          .exec(function (err, requests) {
            if (err) return res.status(500).send(err);
            res.status(200).json(requests);
          });
};


exports.countForCurrentUser = function(req, res, next) {
  if (req.user)
  {
    var userId = req.user._id.toString();

    ToolRequestModel.count({ user: mongoose.Types.ObjectId(userId), status: {'$ne': stateConsts.REJECTED}  }, function(err, count) {
                    if (err) return res.status(500).send(err);

                    return res.status(200).json({ userId: userId, count: count});
                  });
  }
  else {
    return res.status(401).send('Unauthorized');
  }
};

exports.getForUser = function(req, res, next) {
  if (req.user)
  {
    var userId = req.user._id.toString();

    ToolRequestModel.find({ user: mongoose.Types.ObjectId(userId) })
            .populate('user')
            .populate('tool')
            .populate('status')
            .exec(function (err, requests) {
              if (err) return res.status(500).send(err);

              var response = {
                pending: [],
                approved: [],
                rejected: [],
                delivered: []
              };

              for (var i = 0; i < requests.length; i++)
              {
                var request = requests[i];

                if (request.status._id === stateConsts.PENDING) response.pending.push(request);
                else if (request.status._id === stateConsts.APPROVED) response.approved.push(request);
                else if (request.status._id === stateConsts.REJECTED) response.rejected.push(request);
                else if (request.status._id === stateConsts.DELIVERED) response.delivered.push(request);
              }

              res.status(200).json(response);
            });
    }
    else {
      return res.status(401).send('Unauthorized');
    }
};

exports.getPaged = function(req, res, next) {
  var page = req.params.pageNumber;
  var skip = req.params.pageSize;
  var sortColumn = req.params.sortColumn;
  var sortDirection = req.params.sortDirection;

  var itemsToSkip = (page - 1) * skip;

  ToolRequestModel.count({}, function(err, count) {
    var query = ToolRequestModel.find({})
                .skip(itemsToSkip).limit(skip)
                .populate('user')
                .populate('tool')
                .populate('status');

    query.exec(function(err, requests) {
                  if (err) return res.status(500).send(err);

                  var data = { requests: requests, count: count};
                  res.status(200).json(data);
                });
  });
};

exports.getStatuses = function(req, res, next) {
  RequestStatusModel.find({}, function(err, statuses) {
    if (err) return res.status(500).send(statuses);

    res.status(200).json(statuses);
  });
};

exports.create = function(req, res, next) {
  if (req.user)
  {
    var userId = req.user._id.toString();
    var requestCode = req.body.code;

    ToolRequestModel.findOne({ code: requestCode, user: mongoose.Types.ObjectId(userId), "status": {"$ne": stateConsts.REJECTED}  }, function(err, existingToolRequest) {
      if (err) {
        console.log(err);
        return res.status(500).send('There was an issue. Please try again later');
      }

      if (existingToolRequest) {
        res.status(409).send('Tool request with this code already exists');
      }
      else {
        ToolsInventoryModel.findOne({code: requestCode}, function(err, inventoryRecord) {
          var newToolRequest = new ToolRequestModel({
            user: userId,
            tool: inventoryRecord._id
          });

          newToolRequest.save(function (err, toolRequest) {
            if (err) {
              console.log(err);
              return res.status(500).send('There was an issue. Please try again later');
            }

            recalculateInventoryTotal(toolRequest.tool, undefined, toolRequest.status);

            UserModel.findById(userId, function(err, user) {
              user.grabberRequested = true;

              user.save(function (err, user) {
              });
            });

            res.status(200).send('Tool request was created successfully');
          });
        });
      }
    });
  }
  else {
    return res.status(401).send('Unauthorized');
  }
};

exports.update = function(req, res, next) {
  var requestId = req.body._id;

  ToolRequestModel.findById(requestId, function(err, existingToolRequest) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (!existingToolRequest) {
      return res.status(500).send('Tool request you trying to update does not exist');
    }
    else {
      var oldStatus = existingToolRequest.status;
      var newStatus = req.body.status._id;
      var userId = req.body.user._id;

      existingToolRequest.user = userId;
      existingToolRequest.tool = req.body.tool._id;
      existingToolRequest.status = newStatus;

      existingToolRequest.save(function (err, toolRequest) {
        if (err) return res.status(500).send('There was an issue. Please try again later');

        recalculateInventoryTotal(toolRequest.tool, oldStatus, newStatus);

        res.status(200).send('Tool request was updated successfully');
      });
    }
  });
};

var recalculateInventoryTotal = function (toolId, oldStatus, newStatus)
{
  ToolsInventoryModel.findById(toolId, function(err, inventoryRecord) {
    if (err) return;

    if (inventoryRecord) {
      if ((oldStatus == undefined || oldStatus == stateConsts.REJECTED) && inventoryRecord.totalAvailable > 0)
      {
        inventoryRecord.totalAvailable--;
      }
      else if (oldStatus == stateConsts.PENDING && inventoryRecord.totalPending > 0) {
        inventoryRecord.totalPending--;
      }
      else if (oldStatus == stateConsts.APPROVED && inventoryRecord.totalApproved > 0) {
        inventoryRecord.totalApproved--;
      }
      else if (oldStatus == stateConsts.DELIVERED && inventoryRecord.totalDelivered > 0) {
        inventoryRecord.totalDelivered--;
      }

      if (newStatus == stateConsts.PENDING) {
        inventoryRecord.totalPending++;
      }
      else if (newStatus == stateConsts.APPROVED) {
        inventoryRecord.totalApproved++;
      }
      else if (newStatus == stateConsts.REJECTED) {
        inventoryRecord.totalAvailable++;
      }
      else if (newStatus == stateConsts.DELIVERED) {
        inventoryRecord.totalDelivered++;
      }

      inventoryRecord.save(function (err, inventoryRecord) {
        if (err) return;

      });
    }
  });
}

exports.destroy = function(req, res) {
  var requestId = req.params.id;
  if (requestId) {
    ToolRequestModel.findById(requestId).exec(function(err, existingToolRequest) {
      if (err) return next(err);
      var oldStatus = existingToolRequest.status;
      var toolId = existingToolRequest.tool;

      ToolRequestModel.remove({ _id: existingToolRequest._id }, function(err, toolRequest) {
        if (err) {
          console.log("Error while deleting tool request " + err);
          return next(err);

          res.status(500).send('There was an issue. Please try again later');
        }

        recalculateInventoryTotal(toolId, oldStatus, undefined);

        res.status(200).send();
      });
    });
  }
};

exports.removeForUser = function(userId) {
    ToolRequestModel.find({ user: mongoose.Types.ObjectId(userId) }).exec(function(err, requests) {
      for(var index = 0; index < requests.length; index++)
      {
        var request = requests[index];

        var oldStatus = request.status;
        var toolId = request.tool;

        ToolRequestModel.remove({ _id: request._id }, function(err, toolRequest) {
          if (err) {
            console.log("Error while deleting tool request " + err);
            return next(err);

            res.status(500).send('There was an issue. Please try again later');
          }

          recalculateInventoryTotal(toolId, oldStatus, undefined);

          res.status(200).send();
        });
      }
    });
}

exports.changeStatus = function(req, res, next) {
  var requestId = req.body.id;

  ToolRequestModel.findById(requestId, function(err, existingToolRequest) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (!existingToolRequest) {
      return res.status(500).send('Tool request you trying to update does not exist');
    }
    else {
      var oldStatus = existingToolRequest.status;
      var newStatus = req.body.status;
      var userId = existingToolRequest.user;

      existingToolRequest.status = req.body.status;

      existingToolRequest.save(function (err, toolRequest) {
        if (err) return res.status(500).send('There was an issue. Please try again later');

        recalculateInventoryTotal(toolRequest.tool, oldStatus, newStatus);

        if (newStatus == stateConsts.DELIVERED)
        {
          UserModel.findById(userId, function(err, user) {
            user.grabberDelivered = true;

            user.save(function (err, user) {
            });
          });
        }

        res.status(200).send('Tool request status was updated successfully');
      });
    }
  });
};

var mongoose = require('mongoose');
var ToolRequestModel = require('./toolRequest.model');
var RequestStatusModel = require('./requestStatus.model');

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
  var requestCode = req.params.code;

  ToolRequestModel.findOne({ code: requestCode }, function(err, existingToolRequest) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (existingToolRequest) {
      res.status(409).send('Tool request with this code already exists');
    }
    else {
      var newToolRequest = new ToolRequestModel({
        user: req.body.userId,
        tool: req.body.toolId
      });

      newToolRequest.save(function (err, toolRequest) {
        if (err) return res.status(500).send('There was an issue. Please try again later');

        res.status(200).send('Tool request was created successfully');
      });
    }
  });
};

exports.update = function(req, res, next) {
  var requestId = req.body._id;

  ToolRequestModel.findById(requestId, function(err, existingToolRequest) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (!existingToolRequest) {
      return res.status(500).send('Tool request you trying to update does not exist');
    }
    else {
      existingToolRequest.user = req.body.user._id;
      existingToolRequest.tool = req.body.tool._id;
      existingToolRequest.status = req.body.status._id;

      existingToolRequest.save(function (err, toolRequest) {
        if (err) return res.status(500).send('There was an issue. Please try again later');

        res.status(200).send('Tool request was updated successfully');
      });
    }
  });
};

exports.changeStatus = function(req, res, next) {
  var requestId = req.body.id;

  ToolRequestModel.findById(requestId, function(err, existingToolRequest) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (!existingToolRequest) {
      return res.status(500).send('Tool request you trying to update does not exist');
    }
    else {
      existingToolRequest.status = req.body.status;

      existingToolRequest.save(function (err, toolRequest) {
        if (err) return res.status(500).send('There was an issue. Please try again later');

        res.status(200).send('Tool request status was updated successfully');
      });
    }
  });
};

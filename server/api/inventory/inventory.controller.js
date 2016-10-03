var mongoose = require('mongoose');
var ToolsInventoryModel = require('./toolsInventory.model');

exports.get = function(req, res, next) {
  ToolsInventoryModel.find({}, function(err, tools) {
    if (err) return res.status(500).send(err);
    res.status(200).json(tools);
  });
};

exports.getByUser = function(req, res, next) {
  var userId = req.params.userid;

  ToolsInventoryModel.find({ user:  mongoose.Types.ObjectId(userId) }, function(err, tools) {
    if (err) return res.status(500).send(err);
    res.status(200).json(tools);
  });
};

exports.toolAvailable = function(req, res, next) {
  var filterCode = req.params.code;

  ToolsInventoryModel.findOne({ code: filterCode }, function(err, tool) {
    if (err) return res.status(500).send(err);

    if (tool)
    {
      res.status(200).json({ available: tool.totalAvailable > 0, id: tool._id, code: tool.code });
    }
    else {
      res.status(404).send(filterCode + " not found");
    }
  });
};

exports.create = function(req, res, next) {
  ToolsInventoryModel.findOne({code: req.body.code}, function(err, existingInventoryRecord) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (existingInventoryRecord) {
      console.log('inventory already registred ' + inventoryRecord.code);
      res.status(409).send('inventory record with this code already exists');
    }
    else {
      var newToolsInventory = new ToolsInventoryModel({
        code: req.body.code,
        name: req.body.name,
        description: req.body.description
      });

      newToolsInventory.save(function (err, inventoryRecord) {
        if (err)
        {
          console.err(err);
          return res.status(500).send('There was an issue. Please try again later');
        }

        res.status(200).send('Inventory record was created Successfully');
      });
    }
  });
};

exports.update = function(req, res) {
  var code = req.body.code;

  ToolsInventoryModel.findOne({code: req.body.code}, function(err, existingInventoryRecord) {
    if (err) return res.status(500).send(err);

    if (!existingInventoryRecord) {
      console.log('inventory doesn not exit ' + existingInventoryRecord.code);
      res.status(409).send('inventory record with this code does not exist');
    }
    else {
      existingInventoryRecord.code = req.body.code;
      existingInventoryRecord.name = req.body.name;
      existingInventoryRecord.description = req.body.description;
      existingInventoryRecord.totalAvailable = req.body.totalAvailable;

      existingInventoryRecord.save(function (err, inventoryRecord) {
        if (err)
        {
          return res.status(500).send('There was an issue. Please try again later');
        }

        res.status(200).send('Inventory record was updated Successfully');
      });
    }
  });
};

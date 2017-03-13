var mongoose            = require('mongoose');
var ToolsInventoryModel = require('./toolsInventory.model');
var logger              = require('../../components/logger');

exports.get = function(req, res, next) {
  ToolsInventoryModel.find({}, function(err, tools) {
    if (err) {
      logger.error("inventoryController.index " + err);
      res.status(500).send(err);
    }
    else
    {
      res.status(200).json(tools);
    } 
  });
};

exports.getByUser = function(req, res, next) {
  var userId = req.params.userid;

  ToolsInventoryModel.find({ user:  mongoose.Types.ObjectId(userId) }, function(err, tools) {
    if (err) {
      logger.error("inventoryController.getByUser " + err);
      res.status(500).send(err);
    } 
    else
    {
       res.status(200).json(tools);
    }
  });
};

exports.toolAvailable = function(req, res, next) {
  var filterCode = req.params.code;

  ToolsInventoryModel.findOne({ code: filterCode }, function(err, tool) {
    if (err) {
      logger.error("inventoryController.getByUser " + err);
      res.status(500).send(err);
    } 
    else
    {
      if (tool)
      {
        res.status(200).json({ available: tool.totalAvailable > 0, id: tool._id, code: tool.code });
      }
      else {
        res.status(404).send(filterCode + " not found");
      }
    }
  });
};

exports.create = function(req, res, next) {
  ToolsInventoryModel.findOne({code: req.body.code}, function(err, existingInventoryRecord) {
    if (err) {
      logger.error("inventoryController.create " + err);      
      res.status(500).send('There was an issue. Please try again later');
    } 
    else
    {
       if (existingInventoryRecord) {
        logger.error('inventory already registred ' + existingInventoryRecord.code); 
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
            logger.error('inventoryController.create ' + err); 
            res.status(500).send('There was an issue. Please try again later');
          }
          else
          {
            res.status(200).send('Inventory record was created Successfully');
          }
        });
      }
    }
  });
};

exports.update = function(req, res) {
  var code = req.body.code;

  ToolsInventoryModel.findOne({code: req.body.code}, function(err, existingInventoryRecord) {
    if (err) {
      logger.error('inventoryController.update ' + err); 
      res.status(500).send(err);
    } 

    if (!existingInventoryRecord) {
      logger.error('inventory doesn not exit ' + existingInventoryRecord.code); 
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
          logger.error('inventoryController.update ' + err); 
          res.status(500).send('There was an issue. Please try again later');
        }
        else
        {
          res.status(200).send('Inventory record was updated Successfully');
        }
      });
    }
  });
};

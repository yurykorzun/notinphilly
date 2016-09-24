var mongoose = require('mongoose');
var ToolsInventoryModel = require('./toolsInventory.model');

exports.get = function(req, res) {
  ToolsInventoryModel.find({}, function(err, tools) {
    if (err) return res.status(500).send(err);
    res.status(200).json(tools);
  });
};

exports.create = function(req, res, next) {
  ToolsInventoryModel.findOne({code: req.body.code}, function(err, inventoryRecord) {
    if (err) return res.status(500).send('There was an issue. Please try again later');

    if (inventoryRecord) {
      console.log('inventory already registred ' + inventoryRecord.code);
      res.status(409).send('inventory record with this code already exists');
    }
    else {
      var ToolsInventory = mongoose.model('ToolsInventory', ToolsInventoryModel);
      var newToolsInventory = new ToolsInventory({
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

  ToolsInventoryModel.findOne({code: req.body.code}, function(err, inventoryRecord) {
    if (err) return res.status(500).send(err);

    inventoryRecord.code = req.body.code;
    inventoryRecord.name = req.body.name;
    inventoryRecord.description = req.body.description;

    inventoryRecord.save(function (err, user) {
      if (err)
      {
        console.err(err);
        return res.status(500).send('There was an issue. Please try again later');
      }

      res.status(200).send('Inventory record was updated Successfully');
    });
  });
};

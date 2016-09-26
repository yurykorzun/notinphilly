var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var timestamps    = require('mongoose-timestamp');

autoIncrement.initialize(mongoose.connection);

var ToolsInventorySchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  totalAmount: { type: String, required: true, default: 0, min: [0, 'Cannot accept negative amout'] },
},
{ collection: 'ToolsInventory' });

ToolsInventorySchema.plugin(autoIncrement.plugin, 'ToolsInventory');
module.exports = mongoose.model('ToolsInventory', ToolsInventorySchema);

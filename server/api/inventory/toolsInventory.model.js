var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var timestamps    = require('mongoose-timestamp');

autoIncrement.initialize(mongoose.connection);

var ToolsInventorySchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  totalAvailable: { type: Number, required: true, default: 0, min: [0, 'Cannot accept negative amout'] },
  totalPending: { type: Number, required: true, default: 0, min: [0, 'Cannot accept negative amout'] },
  totalDelivered: { type: Number, required: true, default: 0, min: [0, 'Cannot accept negative amout'] }
},
{ collection: 'toolsInventory' });

ToolsInventorySchema.plugin(timestamps);
ToolsInventorySchema.plugin(autoIncrement.plugin, 'ToolsInventory');
module.exports = mongoose.model('ToolsInventory', ToolsInventorySchema);

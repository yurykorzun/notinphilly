var mongoose      = require('mongoose');
var timestamps    = require('mongoose-timestamp');
var Schema        = mongoose.Schema;

var ToolRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tool: {
    type: Number,
    ref: 'ToolsInventory'
  },
  status: {
    type: Number,
    ref: 'RequestStatus',
    default: 0
  }
},
{ collection: 'toolRequests' });

ToolRequestSchema.plugin(timestamps);
module.exports = mongoose.model('ToolRequest', ToolRequestSchema);

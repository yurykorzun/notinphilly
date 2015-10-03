var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoleSchema = new Schema({
    _id: Number,
    name: String
});

module.exports = mongoose.model('Role', RoleSchema);

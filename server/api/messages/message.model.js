var mongoose    = require('mongoose');
var timestamps  = require('mongoose-timestamp');
var Schema      = mongoose.Schema;

var MessageSchema = new Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    to: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    subject: {
        type: String,
        required: true,
        default: ''
    },
    contents: {
        type: String,
        required: true,
        default: ''
    },
    read: Boolean,
    status: {
        type: Number,
        ref: 'MessageStatus',
        default: 0
    }
},
{
    collection: 'messages'
});

MessageSchema.plugin(timestamps);
module.exports = mongoose.model('Message', MessageSchema);
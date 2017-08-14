var mongoose    = require('mongoose');
var timestamps  = require('mongoose-timestamp');
var striptags   = require('striptags');
var moment      = require('moment');
var htmlEntities      = require('html-entities').AllHtmlEntities;
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

MessageSchema.set('toObject', { virtuals: true });
MessageSchema.set('toJSON', { virtuals: true });

MessageSchema
    .virtual('contentsPreview')
    .get(function() {
        var unescapedContents = htmlEntities.decode(this.contents);
        var contentsWithoutTags = striptags(unescapedContents, [], '')
        contentsWithoutTags = contentsWithoutTags.replace(/(\r\n|\n|\r)/gm," ");
        if (contentsWithoutTags.length > 35)
        {
            contentsWithoutTags = contentsWithoutTags.substring(0, 35);
            contentsWithoutTags += "...";
        }
       
        return contentsWithoutTags;
    });

MessageSchema
    .virtual('createdDateFormatted')
    .get(function() {
        return moment(this.createdAt).format('MMM Do YY');
    });


MessageSchema.plugin(timestamps);
module.exports = mongoose.model('Message', MessageSchema);
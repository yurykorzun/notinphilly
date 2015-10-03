var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
    name: {
        type: String,
        required: 'An event name is required',
        unique: true
    },
    description: {
        type: String
    },
    start_time: {
        type: Date
    },
    end_time: {
        type: Date
    },
    photo: String,
    contact_first_name: String,
    contact_last_name: String,
    email: {
        type: String,
        required: 'An email is required!'
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state_id: {
        type: Number,
        ref: 'State'
    },
    zip: {
        type: String,
    }
},
{ collection: 'events' });

module.exports = mongoose.model('Event', EventSchema);

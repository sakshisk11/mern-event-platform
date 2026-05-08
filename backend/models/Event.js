const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    totalSpots: {
        type: Number,
        default: undefined
    },
    spots: {
        type: Number,
        required: true,
        min: 0
    },
    organizer: {
        type: String,
        default: 'EventMaster Pro'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);

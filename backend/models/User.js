const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bookedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    bookedTickets: [{
        event:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        attendeeName: { type: String },
        attendeeId:   { type: String },
        scanned:      { type: Boolean, default: false }, // true after first scan at entry
        scannedAt:    { type: Date, default: null }       // timestamp of when it was scanned
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

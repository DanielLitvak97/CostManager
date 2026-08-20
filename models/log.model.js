const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
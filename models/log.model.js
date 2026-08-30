const mongoose = require('mongoose');

// Define the structure and validation rules for a log document.
const logSchema = new mongoose.Schema({
    // HTTP method used for the request.
    method: {
        type: String,
        required: true
    },

    // URL path accessed by the request.
    path: {
        type: String,
        required: true
    },

    // HTTP status code returned by the endpoint.
    status: {
        type: Number,
        required: true
    },

    // Description of the logged event.
    message: {
        type: String,
        required: true
    },

    // Store the date and time when the event occurred.
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// Create the Mongoose model used to access log documents.
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
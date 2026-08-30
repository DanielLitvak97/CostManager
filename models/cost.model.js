const mongoose = require('mongoose');

// Define the structure and validation rules for a cost document.
const costSchema = new mongoose.Schema({
    // Description of the cost item.
    description: {
        type: String,
        required: true
    },

    // Category must be one of the five allowed values.
    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sports', 'education']
    },

    // Store the numeric ID of the user who owns the cost.
    userid: {
        type: Number,
        required: true
    },

    // Store the cost amount as a double-precision number.
    sum: {
        type: mongoose.Schema.Types.Double,
        required: true
    },

    // Store the date on which the cost was created.
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// Create the Mongoose model used to access cost documents.
const Cost = mongoose.model('Cost', costSchema);

module.exports = Cost;
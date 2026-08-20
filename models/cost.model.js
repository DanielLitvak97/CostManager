const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sports', 'education']
    },
    userid: {
        type: Number,
        required: true
    },
    sum: {
        type: mongoose.Schema.Types.Double,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Cost = mongoose.model('Cost', costSchema);

module.exports = Cost;
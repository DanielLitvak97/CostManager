const mongoose = require('mongoose');

// Define the structure and validation rules for a cached monthly report.
const reportSchema = new mongoose.Schema({
    // Store the numeric ID of the user.
    userid: {
        type: Number,
        required: true
    },

    // Store the year of the reported month.
    year: {
        type: Number,
        required: true
    },

    // Store the month of the report.
    month: {
        type: Number,
        required: true
    },

    // Store the calculated costs grouped by category.
    costs: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

// Ensure that only one cached report exists for each user, year, and month.
reportSchema.index(
    {
        userid: 1,
        year: 1,
        month: 1
    },
    {
        unique: true
    }
);

// Create the Mongoose model used to access cached reports.
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
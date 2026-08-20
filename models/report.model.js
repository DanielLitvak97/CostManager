const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userid: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    costs: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

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

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
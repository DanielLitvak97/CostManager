const mongoose = require('mongoose');

// Define the structure and validation rules for a user document.
const userSchema = new mongoose.Schema({
    // Store the user's numeric ID and prevent duplicate IDs.
    id: {
        type: Number,
        required: true,
        unique: true
    },

    // Store the user's first name.
    first_name: {
        type: String,
        required: true
    },

    // Store the user's last name.
    last_name: {
        type: String,
        required: true
    },

    // Store the user's birthday as a date.
    birthday: {
        type: Date,
        required: true
    }
});

// Create the Mongoose model used to access user documents.
const User = mongoose.model('User', userSchema);

module.exports = User;
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // The connection was successfully established.
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        // The application cannot work without a database connection.
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
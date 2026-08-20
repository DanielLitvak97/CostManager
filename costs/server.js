const dotenv = require('dotenv');
const app = require('./app');
const connectToDatabase = require('../config/database');

dotenv.config();

const PORT = process.env.PORT || process.env.COSTS_PORT || 3002;

const startServer = async () => {
    // Connect this independent process to MongoDB Atlas.
    await connectToDatabase();

    app.listen(PORT, '0.0.0.0', () => {
        // The costs process is now ready to receive requests.
        console.log(`Costs service is running on port ${PORT}`);
    });
};

startServer();
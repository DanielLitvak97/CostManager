const pino = require('pino');
const Log = require('../models/log.model');

const logger = pino({
    level: 'info'
});

const saveLog = async (logData) => {
    try {
        await Log.create(logData);
    } catch (error) {
        // Logging errors should not stop the main application.
        console.error('Failed to save log to MongoDB:', error.message);
    }
};

const logRequest = async (req) => {
    const logData = {
        method: req.method,
        path: req.originalUrl,
        status: 200,
        message: 'HTTP request received',
        timestamp: new Date()
    };

    // Create the log message using Pino.
    logger.info(logData, 'HTTP request received');

    await saveLog(logData);
};

const logEndpoint = async (req, status, message) => {
    const logData = {
        method: req.method,
        path: req.originalUrl,
        status: status,
        message: message,
        timestamp: new Date()
    };

    // Create the endpoint log message using Pino.
    logger.info(logData, message);

    await saveLog(logData);
};

module.exports = {
    logger,
    logRequest,
    logEndpoint
};
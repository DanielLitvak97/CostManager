const { logRequest, logEndpoint } = require('../utils/logger');

const requestLogger = (req, res, next) => {
    // Unit tests do not use MongoDB logging.
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    // Log every HTTP request received by the server.
    logRequest(req);

    res.on('finish', () => {
        // Log the endpoint after it has handled the request.
        logEndpoint(
            req,
            res.statusCode,
            'Endpoint accessed'
        );
    });

    next();
};

module.exports = requestLogger;
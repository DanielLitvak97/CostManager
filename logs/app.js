const express = require('express');
const requestLogger = require('../middleware/requestLogger');
const logRoutes = require('./routes');

const app = express();

app.use(express.json());

// Every request received by the logs process is logged.
app.use(requestLogger);

app.use(logRoutes);

module.exports = app;
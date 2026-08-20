const express = require('express');
const requestLogger = require('../middleware/requestLogger');
const userRoutes = require('./routes');

const app = express();

app.use(express.json());

// Every request received by this process is logged.
app.use(requestLogger);

app.use(userRoutes);

module.exports = app;
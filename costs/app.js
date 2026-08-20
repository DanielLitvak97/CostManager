const express = require('express');
const requestLogger = require('../middleware/requestLogger');
const costRoutes = require('./routes');

const app = express();

app.use(express.json());

// Every request received by the costs process is logged.
app.use(requestLogger);

app.use(costRoutes);

module.exports = app;
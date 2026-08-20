const express = require('express');
const requestLogger = require('../middleware/requestLogger');
const aboutRoutes = require('./routes');

const app = express();

app.use(express.json());

// Every request received by the about process is logged.
app.use(requestLogger);

app.use(aboutRoutes);

module.exports = app;
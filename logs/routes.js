const express = require('express');
const Log = require('../models/log.model');

const router = express.Router();

router.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find({});

        // Return all logs stored in MongoDB.
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({
            id: 'LOGS_LIST_ERROR',
            message: error.message
        });
    }
});

module.exports = router;
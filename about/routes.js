const express = require('express');

const router = express.Router();

router.get('/api/about', (req, res) => {
    try {
        const teamMembers = [
            {
                first_name: process.env.TEAM_MEMBER_1_FIRST_NAME,
                last_name: process.env.TEAM_MEMBER_1_LAST_NAME
            },
            {
                first_name: process.env.TEAM_MEMBER_2_FIRST_NAME,
                last_name: process.env.TEAM_MEMBER_2_LAST_NAME
            },
            {
                first_name: process.env.TEAM_MEMBER_3_FIRST_NAME,
                last_name: process.env.TEAM_MEMBER_3_LAST_NAME
            }
        ];

        // Return only the first and last names of the development team.
        return res.status(200).json(teamMembers);
    } catch (error) {
        return res.status(500).json({
            id: 'ABOUT_ERROR',
            message: error.message
        });
    }
});

module.exports = router;
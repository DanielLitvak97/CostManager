const express = require('express');
const User = require('../models/user.model');
const Cost = require('../models/cost.model');

const router = express.Router();

const validateUser = (body) => {
    const {
        id,
        first_name,
        last_name,
        birthday
    } = body;

    // Check every required property separately.
    if (id === undefined) {
        return 'id is required';
    }

    if (first_name === undefined) {
        return 'first_name is required';
    }

    if (last_name === undefined) {
        return 'last_name is required';
    }

    if (birthday === undefined) {
        return 'birthday is required';
    }

    // Check that the user ID is a positive integer.
    if (typeof id !== 'number' ||
        !Number.isInteger(id) ||
        id <= 0) {
        return 'id must be a positive integer';
    }

    // Check that both names are non-empty strings.
    if (typeof first_name !== 'string' ||
        first_name.trim().length === 0) {
        return 'first_name must be a non-empty string';
    }

    if (typeof last_name !== 'string' ||
        last_name.trim().length === 0) {
        return 'last_name must be a non-empty string';
    }

    // Check that the supplied birthday is a valid date.
    const birthdayDate = new Date(birthday);

    if (Number.isNaN(birthdayDate.getTime())) {
        return 'birthday must be a valid date';
    }

    return null;
};

router.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, {
            _id: 0,
            id: 1,
            first_name: 1,
            last_name: 1,
            birthday: 1
        });

        // Return all users using the required property names.
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            id: 'USERS_LIST_ERROR',
            message: error.message
        });
    }
});

router.get('/api/users/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validate the ID before querying MongoDB.
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                id: 'INVALID_USER_ID',
                message: 'User id must be a positive integer'
            });
        }

        const user = await User.findOne({
            id: id
        });

        if (!user) {
            return res.status(404).json({
                id: 'USER_NOT_FOUND',
                message: 'User not found'
            });
        }

        const result = await Cost.aggregate([
            {
                $match: {
                    userid: id
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$sum'
                    }
                }
            }
        ]);

        // MongoDB returns no aggregation document when the user has no costs.
        const total = result.length > 0 ? result[0].total : 0;

        return res.status(200).json({
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
            total: total
        });
    } catch (error) {
        return res.status(500).json({
            id: 'USER_DETAILS_ERROR',
            message: error.message
        });
    }
});

router.post('/api/add', async (req, res) => {
    try {
        const validationError = validateUser(req.body);

        // Reject invalid input before accessing the database.
        if (validationError) {
            return res.status(400).json({
                id: 'INVALID_USER_DATA',
                message: validationError
            });
        }

        const existingUser = await User.findOne({
            id: req.body.id
        });

        // The assignment does not allow duplicate users.
        if (existingUser) {
            return res.status(409).json({
                id: 'USER_ALREADY_EXISTS',
                message: 'A user with this id already exists'
            });
        }

        const user = new User({
            id: req.body.id,
            first_name: req.body.first_name.trim(),
            last_name: req.body.last_name.trim(),
            birthday: new Date(req.body.birthday)
        });

        const savedUser = await user.save();

        // Return the newly created user without MongoDB's internal _id.
        return res.status(201).json({
            id: savedUser.id,
            first_name: savedUser.first_name,
            last_name: savedUser.last_name,
            birthday: savedUser.birthday
        });
    } catch (error) {
        return res.status(500).json({
            id: 'USER_ADD_ERROR',
            message: error.message
        });
    }
});

module.exports = router;
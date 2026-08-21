const express = require('express');
const Cost = require('../models/cost.model');
const User = require('../models/user.model');
const Report = require('../models/report.model');

const router = express.Router();

const validCategories = [
    'food',
    'health',
    'housing',
    'sports',
    'education'
];

const reportCategories = [
    'food',
    'education',
    'health',
    'housing',
    'sports'
];

const validateCost = (body) => {
    const {
        description,
        category,
        userid,
        sum
    } = body;

    // Check that all required cost properties exist.
    if (description === undefined) {
        return 'description is required';
    }

    if (category === undefined) {
        return 'category is required';
    }

    if (userid === undefined) {
        return 'userid is required';
    }

    if (sum === undefined) {
        return 'sum is required';
    }

    // Check the description.
    if (typeof description !== 'string' ||
        description.trim().length === 0) {
        return 'description must be a non-empty string';
    }

    // Check the category.
    if (typeof category !== 'string' ||
        !validCategories.includes(category)) {
        return 'category must be food, health, housing, sports or education';
    }

    // Check the user ID.
    if (typeof userid !== 'number' ||
        !Number.isInteger(userid)) {
        return 'userid must be an integer';
    }

    // Check that sum is a number.
    if (typeof sum !== 'number' ||
        !Number.isFinite(sum)) {
        return 'sum must be a number';
    }

    // A cost cannot have a negative value.
    if (sum < 0) {
        return 'cost cannot be negative number';
    }

    // A cost of zero is not allowed.
    if (sum === 0) {
        return 'sum must be greater than zero';
    }

    return null;
};

const validateDate = (dateValue) => {
    const date = new Date(dateValue);

    // Check that the supplied date is valid.
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const isPastCalendarDate = (date) => {
    const today = new Date();

    // Compare calendar dates rather than the exact time.
    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const dateStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    return dateStart < todayStart;
};

const validateReportQuery = (query) => {
    const {
        id,
        year,
        month
    } = query;

    // Check that all required query parameters were supplied.
    if (id === undefined) {
        return 'id is required';
    }

    if (year === undefined) {
        return 'year is required';
    }

    if (month === undefined) {
        return 'month is required';
    }

    const userId = Number(id);
    const reportYear = Number(year);
    const reportMonth = Number(month);

    // Check that the user ID is a valid integer.
    if (!Number.isInteger(userId)) {
        return 'id must be an integer';
    }

    // Check that the year is a valid four-digit year.
    if (!Number.isInteger(reportYear) ||
        reportYear < 1000 ||
        reportYear > 9999) {
        return 'year must be a valid four-digit year';
    }

    // Check that the month is between January and December.
    if (!Number.isInteger(reportMonth) ||
        reportMonth < 1 ||
        reportMonth > 12) {
        return 'month must be between 1 and 12';
    }

    return null;
};

const isPastMonth = (year, month) => {
    const currentDate = new Date();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Compare the requested month with the current calendar month.
    return year < currentYear ||
        (year === currentYear && month < currentMonth);
};

const createReport = async (userid, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const costs = await Cost.find({
        userid: userid,
        date: {
            $gte: startDate,
            $lt: endDate
        }
    }).sort({
        date: 1
    });

    const categorizedCosts = {};

    // Create an empty array for every required category.
    for (const category of validCategories) {
        categorizedCosts[category] = [];
    }

    for (const cost of costs) {
        categorizedCosts[cost.category].push({
            sum: cost.sum,
            description: cost.description,
            day: cost.date.getDate()
        });
    }

    const reportCosts = [];

    // Every required category must appear in the report.
    for (const category of reportCategories) {
        const reportCategory = category === 'sports'
            ? 'Sport'
            : category;

        reportCosts.push({
            [reportCategory]: categorizedCosts[category]
        });
    }

    return {
        userid: userid,
        year: year,
        month: month,
        costs: reportCosts
    };
};

router.post('/api/add', async (req, res) => {
    // Record when the request was received.
    const requestReceivedAt = new Date();

    try {
        const validationError = validateCost(req.body);

        // Reject invalid input before accessing MongoDB.
        if (validationError) {
            return res.status(400).json({
                id: 'INVALID_COST_DATA',
                message: validationError
            });
        }

        const user = await User.findOne({
            id: req.body.userid
        });

        // A cost cannot be created for a non-existing user.
        if (!user) {
            return res.status(404).json({
                id: 'USER_NOT_FOUND',
                message: 'The specified user does not exist'
            });
        }

        let costDate = requestReceivedAt;

        if (req.body.date !== undefined) {
            costDate = validateDate(req.body.date);

            if (!costDate) {
                return res.status(400).json({
                    id: 'INVALID_DATE',
                    message: 'date must be a valid date'
                });
            }
        }

        // The server must not accept costs belonging to a past date.
        if (isPastCalendarDate(costDate)) {
            return res.status(400).json({
                id: 'PAST_DATE_NOT_ALLOWED',
                message: 'A cost cannot have a date in the past'
            });
        }

        const cost = new Cost({
            description: req.body.description.trim(),
            category: req.body.category,
            userid: req.body.userid,
            sum: req.body.sum,
            date: costDate
        });

        const savedCost = await cost.save();

        // Return the newly created cost item.
        return res.status(201).json({
            description: savedCost.description,
            category: savedCost.category,
            userid: savedCost.userid,
            sum: savedCost.sum,
            date: savedCost.date
        });
    } catch (error) {
        return res.status(500).json({
            id: 'COST_ADD_ERROR',
            message: error.message
        });
    }
});

router.get('/api/report', async (req, res) => {
    try {
        const validationError = validateReportQuery(req.query);

        // Reject invalid query parameters before querying MongoDB.
        if (validationError) {
            return res.status(400).json({
                id: 'INVALID_REPORT_QUERY',
                message: validationError
            });
        }

        const userid = Number(req.query.id);
        const year = Number(req.query.year);
        const month = Number(req.query.month);

        const user = await User.findOne({
            id: userid
        });

        // A report cannot be generated for a non-existing user.
        if (!user) {
            return res.status(404).json({
                id: 'USER_NOT_FOUND',
                message: 'The specified user does not exist'
            });
        }

        /*
         * Computed Design Pattern:
         * Past reports are calculated only when they do not already exist.
         * Once calculated, the report is stored in MongoDB and reused.
         */
        if (isPastMonth(year, month)) {
            const cachedReport = await Report.findOne({
                userid: userid,
                year: year,
                month: month
            }).lean();

            // Return the previously computed report when it exists.
            if (cachedReport) {
                return res.status(200).json({
                    userid: cachedReport.userid,
                    year: cachedReport.year,
                    month: cachedReport.month,
                    costs: cachedReport.costs
                });
            }

            const calculatedReport = await createReport(
                userid,
                year,
                month
            );

            await Report.create(calculatedReport);

            return res.status(200).json(calculatedReport);
        }

        // Current and future reports are calculated directly.
        const calculatedReport = await createReport(
            userid,
            year,
            month
        );

        return res.status(200).json(calculatedReport);
    } catch (error) {
        return res.status(500).json({
            id: 'REPORT_ERROR',
            message: error.message
        });
    }
});

module.exports = router;
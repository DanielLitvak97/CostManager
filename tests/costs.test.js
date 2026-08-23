jest.mock('../models/cost.model');
        jest.mock('../models/user.model');
        jest.mock('../models/report.model');

        const request = require('supertest');
        const Cost = require('../models/cost.model');
        const User = require('../models/user.model');
        const Report = require('../models/report.model');
        const app = require('../costs/app');

        describe('Costs microservice', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            describe('POST /api/add', () => {
                test('adds a valid cost', async () => {
                    User.findOne.mockResolvedValue({
                        id: 123123,
                        first_name: 'mosh',
                        last_name: 'israeli'
                    });

                    const savedCost = {
                        description: 'milk',
                        category: 'food',
                        userid: 123123,
                        sum: 8,
                        date: new Date('2026-08-19T10:00:00.000Z'),
                        save: jest.fn()
                    };

                    savedCost.save.mockResolvedValue(savedCost);

                    Cost.mockImplementation(() => savedCost);

                    const response = await request(app)
                        .post('/api/add')
                        .send({
                            description: 'milk',
                            category: 'food',
                            userid: 123123,
                            sum: 8
                        });

                    expect(response.statusCode).toBe(201);

                    expect(response.body).toEqual({
                        description: 'milk',
                        category: 'food',
                        userid: 123123,
                        sum: 8,
                        date: expect.any(String)
                    });

                    expect(User.findOne).toHaveBeenCalledWith({
                        id: 123123
                    });

                    expect(savedCost.save).toHaveBeenCalledTimes(1);
                });

                test('uses the supplied date when it is valid and not in the past', async () => {
                    User.findOne.mockResolvedValue({
                        id: 123123
                    });

                    const savedCost = {
                        description: 'book',
                        category: 'education',
                        userid: 123123,
                        sum: 50,
                        date: new Date('2099-01-01T10:00:00.000Z'),
                        save: jest.fn()
                    };

                    savedCost.save.mockResolvedValue(savedCost);

                    Cost.mockImplementation(() => savedCost);

                    const response = await request(app)
                        .post('/api/add')
                        .send({
                            description: 'book',
                            category: 'education',
                            userid: 123123,
                            sum: 50,
                            date: '2099-01-01'
                        });

                    expect(response.statusCode).toBe(201);
                    expect(response.body.date).toBe(
                        '2099-01-01T10:00:00.000Z'
                    );
                });

                test('rejects missing required properties', async () => {
                    const response = await request(app)
                        .post('/api/add')
                        .send({
                            description: 'milk',
                            category: 'food'
                        });

                    expect(response.statusCode).toBe(400);

                    expect(response.body).toEqual({
                        id: 'INVALID_COST_DATA',
                        message: 'userid is required'
                    });

                    expect(User.findOne).not.toHaveBeenCalled();
                });

                test('rejects an empty description', async () => {
                    const response = await request(app)
                        .post('/api/add')
                        .send({
                            description: '',
                            category: 'food',
                            userid: 123123,
                            sum: 8
                        });

                    expect(response.statusCode).toBe(400);

                    expect(response.body).toEqual({
                        id: 'INVALID_COST_DATA',
                        message: 'description must be a non-empty string'
                    });
                });

                test('rejects an invalid category', async () => {
                    const response = await request(app)
                        .post('/api/add')
                        .send({
                            description: 'milk',
                            category: 'games',
                            userid: 123123,
                            sum: 8
                        });

                    expect(response.statusCode).toBe(400);

                    expect(response.body).toEqual({
                        id: 'INVALID_COST_DATA',
                        message: 'category must be food, health, housing, sports or education'
                    });
                });

        test('rejects a non-integer userid', async () => {
            const response = await request(app)
                .post('/api/add')
                .send({
                    description: 'milk',
                    category: 'food',
                    userid: '123123',
                    sum: 8
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_COST_DATA',
                message: 'userid must be a positive integer'
            });
        });

        test('rejects a zero sum', async () => {
            const response = await request(app)
                .post('/api/add')
                .send({
                    description: 'milk',
                    category: 'food',
                    userid: 123123,
                    sum: 0
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_COST_DATA',
                message: 'sum must be greater than zero'
            });
        });

                test('rejects a negative sum', async () => {
                    const response = await request(app)
                        .post('/api/add')
                        .send({
                            description: 'milk',
                            category: 'food',
                            userid: 123123,
                            sum: -8
                        });

                    expect(response.statusCode).toBe(400);

                    expect(response.body).toEqual({
                        id: 'INVALID_COST_DATA',
                        message: 'cost cannot be negative number'
                    });
                });

        test('rejects a non-existing user', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/add')
                .send({
                    description: 'milk',
                    category: 'food',
                    userid: 999999,
                    sum: 8
                });

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                id: 'USER_NOT_FOUND',
                message: 'The specified user does not exist'
            });
        });

        test('rejects an invalid date', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            const response = await request(app)
                .post('/api/add')
                .send({
                    description: 'milk',
                    category: 'food',
                    userid: 123123,
                    sum: 8,
                    date: 'not-a-date'
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_DATE',
                message: 'date must be a valid date'
            });
        });

        test('rejects a cost whose date is in the past', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            const response = await request(app)
                .post('/api/add')
                .send({
                    description: 'milk',
                    category: 'food',
                    userid: 123123,
                    sum: 8,
                    date: '2020-01-01'
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'PAST_DATE_NOT_ALLOWED',
                message: 'A cost cannot have a date in the past'
            });

            expect(Cost).not.toHaveBeenCalled();
        });

        test('returns JSON error when saving the cost fails', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            const savedCost = {
                description: 'milk',
                category: 'food',
                userid: 123123,
                sum: 8,
                date: new Date(),
                save: jest.fn()
            };

            savedCost.save.mockRejectedValue(
                new Error('Database error')
            );

            Cost.mockImplementation(() => savedCost);

            const response = await request(app)
                .post('/api/add')
                .send({
                    description: 'milk',
                    category: 'food',
                    userid: 123123,
                    sum: 8
                });

            expect(response.statusCode).toBe(500);

            expect(response.body).toEqual({
                id: 'COST_ADD_ERROR',
                message: 'Database error'
            });
        });
    });

    describe('GET /api/report', () => {
        test('returns a current-month report with all categories', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            Cost.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([
                    {
                        userid: 123123,
                        description: 'milk',
                        category: 'food',
                        sum: 8,
                        date: new Date('2026-08-19T10:00:00.000Z')
                    }
                ])
            });

            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 2026,
                    month: 8
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                userid: 123123,
                year: 2026,
                month: 8,
                costs: [
                    {
                        food: [
                            {
                                sum: 8,
                                description: 'milk',
                                day: 19
                            }
                        ]
                    },
                    {
                        education: []
                    },
                    {
                        health: []
                    },
                    {
                        housing: []
                    },
                    {
                        sports: []
                    }
                ]
            });

            expect(Report.findOne).not.toHaveBeenCalled();
            expect(Report.create).not.toHaveBeenCalled();
        });

        test('returns a future-month report without caching it', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            Cost.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });

            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 2099,
                    month: 12
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                userid: 123123,
                year: 2099,
                month: 12,
                costs: [
                    {
                        food: []
                    },
                    {
                        education: []
                    },
                    {
                        health: []
                    },
                    {
                        housing: []
                    },
                    {
                        sports: []
                    }
                ]
            });

            expect(Report.findOne).not.toHaveBeenCalled();
            expect(Report.create).not.toHaveBeenCalled();
        });

        test('calculates and caches a past-month report', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            Report.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });

            Cost.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([
                    {
                        userid: 123123,
                        description: 'old book',
                        category: 'education',
                        sum: 75,
                        date: new Date('2025-05-10T10:00:00.000Z')
                    }
                ])
            });

            Report.create.mockResolvedValue({});

            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 2025,
                    month: 5
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual({
                userid: 123123,
                year: 2025,
                month: 5,
                costs: [
                    {
                        food: []
                    },
                    {
                        education: [
                            {
                                sum: 75,
                                description: 'old book',
                                day: 10
                            }
                        ]
                    },
                    {
                        health: []
                    },
                    {
                        housing: []
                    },
                    {
                        sports: []
                    }
                ]
            });

            expect(Report.findOne).toHaveBeenCalledWith({
                userid: 123123,
                year: 2025,
                month: 5
            });

            expect(Report.create).toHaveBeenCalledTimes(1);
        });

        test('returns an existing cached past-month report', async () => {
            User.findOne.mockResolvedValue({
                id: 123123
            });

            const cachedReport = {
                userid: 123123,
                year: 2025,
                month: 5,
                costs: [
                    {
                        food: []
                    },
                    {
                        education: []
                    },
                    {
                        health: []
                    },
                    {
                        housing: []
                    },
                    {
                        sports: []
                    }
                ]
            };

            Report.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(cachedReport)
            });

            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 2025,
                    month: 5
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(cachedReport);

            expect(Cost.find).not.toHaveBeenCalled();
            expect(Report.create).not.toHaveBeenCalled();
        });

        test('rejects a missing id', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({
                    year: 2026,
                    month: 8
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_REPORT_QUERY',
                message: 'id is required'
            });
        });

        test('rejects an invalid id', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 'abc',
                    year: 2026,
                    month: 8
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_REPORT_QUERY',
                message: 'id must be a positive integer'
            });
        });

        test('rejects an invalid year', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 99,
                    month: 8
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_REPORT_QUERY',
                message: 'year must be a valid four-digit year'
            });
        });

        test('rejects an invalid month', async () => {
            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 2026,
                    month: 13
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toEqual({
                id: 'INVALID_REPORT_QUERY',
                message: 'month must be between 1 and 12'
            });
        });

        test('returns 404 when the report user does not exist', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 999999,
                    year: 2026,
                    month: 8
                });

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual({
                id: 'USER_NOT_FOUND',
                message: 'The specified user does not exist'
            });
        });

        test('returns JSON error when the report database operation fails', async () => {
            User.findOne.mockRejectedValue(
                new Error('Database error')
            );

            const response = await request(app)
                .get('/api/report')
                .query({
                    id: 123123,
                    year: 2026,
                    month: 8
                });

            expect(response.statusCode).toBe(500);

            expect(response.body).toEqual({
                id: 'REPORT_ERROR',
                message: 'Database error'
            });
        });
    });
});
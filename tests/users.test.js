jest.mock('../models/user.model');
jest.mock('../models/cost.model');

const request = require('supertest');
const User = require('../models/user.model');
const Cost = require('../models/cost.model');
const app = require('../users/app');

describe('Users microservice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/users returns all users', async () => {
        User.find.mockResolvedValue([
            {
                id: 123123,
                first_name: 'mosh',
                last_name: 'israeli',
                birthday: new Date('2000-09-09')
            }
        ]);

        const response = await request(app)
            .get('/api/users');

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli',
            birthday: expect.any(String)
        });

        expect(User.find).toHaveBeenCalledTimes(1);
    });

    test('GET /api/users returns an empty array when there are no users', async () => {
        User.find.mockResolvedValue([]);

        const response = await request(app)
            .get('/api/users');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('GET /api/users returns JSON error when database access fails', async () => {
        User.find.mockRejectedValue(
            new Error('Database error')
        );

        const response = await request(app)
            .get('/api/users');

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            id: 'USERS_LIST_ERROR',
            message: 'Database error'
        });
    });

    test('GET /api/users/:id returns user details and total costs', async () => {
        User.findOne.mockResolvedValue({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli'
        });

        Cost.aggregate.mockResolvedValue([
            {
                _id: null,
                total: 25
            }
        ]);

        const response = await request(app)
            .get('/api/users/123123');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            first_name: 'mosh',
            last_name: 'israeli',
            id: 123123,
            total: 25
        });

        expect(User.findOne).toHaveBeenCalledWith({
            id: 123123
        });

        expect(Cost.aggregate).toHaveBeenCalledTimes(1);
    });

    test('GET /api/users/:id returns total 0 when user has no costs', async () => {
        User.findOne.mockResolvedValue({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli'
        });

        Cost.aggregate.mockResolvedValue([]);

        const response = await request(app)
            .get('/api/users/123123');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            first_name: 'mosh',
            last_name: 'israeli',
            id: 123123,
            total: 0
        });
    });

    test('GET /api/users/:id rejects an invalid user id', async () => {
        const response = await request(app)
            .get('/api/users/abc');

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            id: 'INVALID_USER_ID',
            message: 'User id must be a positive integer'
        });

        expect(User.findOne).not.toHaveBeenCalled();
    });

    test('GET /api/users/:id returns 404 when the user does not exist', async () => {
        User.findOne.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/users/999999');

        expect(response.statusCode).toBe(404);

        expect(response.body).toEqual({
            id: 'USER_NOT_FOUND',
            message: 'User not found'
        });
    });

    test('GET /api/users/:id returns JSON error when the database fails', async () => {
        User.findOne.mockRejectedValue(
            new Error('Database error')
        );

        const response = await request(app)
            .get('/api/users/123123');

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            id: 'USER_DETAILS_ERROR',
            message: 'Database error'
        });
    });

    test('POST /api/add adds a new user', async () => {
        User.findOne.mockResolvedValue(null);

        const savedUser = {
            id: 456456,
            first_name: 'Daniel',
            last_name: 'Cohen',
            birthday: new Date('2000-05-20'),
            save: jest.fn()
        };

        savedUser.save.mockResolvedValue(savedUser);

        User.mockImplementation(() => savedUser);

        const response = await request(app)
            .post('/api/add')
            .send({
                id: 456456,
                first_name: 'Daniel',
                last_name: 'Cohen',
                birthday: '2000-05-20'
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toEqual({
            id: 456456,
            first_name: 'Daniel',
            last_name: 'Cohen',
            birthday: expect.any(String)
        });

        expect(User.findOne).toHaveBeenCalledWith({
            id: 456456
        });

        expect(savedUser.save).toHaveBeenCalledTimes(1);
    });

    test('POST /api/add rejects missing required properties', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                id: 456456,
                first_name: 'Daniel'
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            id: 'INVALID_USER_DATA',
            message: 'last_name is required'
        });

        expect(User.findOne).not.toHaveBeenCalled();
    });

    test('POST /api/add rejects a non-integer id', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                id: 'abc',
                first_name: 'Daniel',
                last_name: 'Cohen',
                birthday: '2000-05-20'
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            id: 'INVALID_USER_DATA',
            message: 'id must be a positive integer'
        });
    });

    test('POST /api/add rejects empty names', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                id: 456456,
                first_name: '',
                last_name: 'Cohen',
                birthday: '2000-05-20'
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            id: 'INVALID_USER_DATA',
            message: 'first_name must be a non-empty string'
        });
    });

    test('POST /api/add rejects an invalid birthday', async () => {
        const response = await request(app)
            .post('/api/add')
            .send({
                id: 456456,
                first_name: 'Daniel',
                last_name: 'Cohen',
                birthday: 'not-a-date'
            });

        expect(response.statusCode).toBe(400);

        expect(response.body).toEqual({
            id: 'INVALID_USER_DATA',
            message: 'birthday must be a valid date'
        });
    });

    test('POST /api/add rejects a duplicate user', async () => {
        User.findOne.mockResolvedValue({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli'
        });

        const response = await request(app)
            .post('/api/add')
            .send({
                id: 123123,
                first_name: 'mosh',
                last_name: 'israeli',
                birthday: '2000-09-09'
            });

        expect(response.statusCode).toBe(409);

        expect(response.body).toEqual({
            id: 'USER_ALREADY_EXISTS',
            message: 'A user with this id already exists'
        });
    });

    test('POST /api/add returns JSON error when saving fails', async () => {
        User.findOne.mockResolvedValue(null);

        const savedUser = {
            id: 456456,
            first_name: 'Daniel',
            last_name: 'Cohen',
            birthday: new Date('2000-05-20'),
            save: jest.fn()
        };

        savedUser.save.mockRejectedValue(
            new Error('Database error')
        );

        User.mockImplementation(() => savedUser);

        const response = await request(app)
            .post('/api/add')
            .send({
                id: 456456,
                first_name: 'Daniel',
                last_name: 'Cohen',
                birthday: '2000-05-20'
            });

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            id: 'USER_ADD_ERROR',
            message: 'Database error'
        });
    });
});
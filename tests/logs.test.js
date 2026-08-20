jest.mock('../models/log.model');

const request = require('supertest');
const Log = require('../models/log.model');
const app = require('../logs/app');

describe('Logs microservice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/logs returns all logs', async () => {
        Log.find.mockResolvedValue([
            {
                method: 'GET',
                path: '/api/users',
                status: 200,
                message: 'Endpoint accessed',
                timestamp: new Date('2026-08-19T10:00:00.000Z')
            }
        ]);

        const response = await request(app)
            .get('/api/logs');

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveLength(1);

        expect(response.body[0]).toEqual({
            method: 'GET',
            path: '/api/users',
            status: 200,
            message: 'Endpoint accessed',
            timestamp: expect.any(String)
        });

        expect(Log.find).toHaveBeenCalledWith({});
    });

    test('GET /api/logs returns an empty array when there are no logs', async () => {
        Log.find.mockResolvedValue([]);

        const response = await request(app)
            .get('/api/logs');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('GET /api/logs returns JSON error when the database fails', async () => {
        Log.find.mockRejectedValue(
            new Error('Database error')
        );

        const response = await request(app)
            .get('/api/logs');

        expect(response.statusCode).toBe(500);

        expect(response.body).toEqual({
            id: 'LOGS_LIST_ERROR',
            message: 'Database error'
        });
    });
});
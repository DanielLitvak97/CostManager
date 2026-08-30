const request = require('supertest');
const app = require('../about/app');

describe('About microservice', () => {
    // Set the development team members used by the test environment.
    beforeEach(() => {
        process.env.TEAM_MEMBER_1_FIRST_NAME = 'Daniel';
        process.env.TEAM_MEMBER_1_LAST_NAME = 'Litvak';

        process.env.TEAM_MEMBER_2_FIRST_NAME = 'Daniel';
        process.env.TEAM_MEMBER_2_LAST_NAME = 'Drori';

        process.env.TEAM_MEMBER_3_FIRST_NAME = 'Adir';
        process.env.TEAM_MEMBER_3_LAST_NAME = 'Eliash';
    });

    // Verify that the endpoint returns the expected development team.
    test('GET /api/about returns the development team', async () => {
        const response = await request(app)
            .get('/api/about');

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual([
            {
                first_name: 'Daniel',
                last_name: 'Litvak'
            },
            {
                first_name: 'Daniel',
                last_name: 'Drori'
            },
            {
                first_name: 'Adir',
                last_name: 'Eliash'
            }
        ]);
    });

    // Verify that each team member contains only the required properties.
    test('GET /api/about returns only first_name and last_name', async () => {
        const response = await request(app)
            .get('/api/about');

        expect(response.statusCode).toBe(200);

        // Check that no additional properties are returned.
        for (const member of response.body) {
            expect(Object.keys(member).sort()).toEqual([
                'first_name',
                'last_name'
            ]);
        }
    });
});
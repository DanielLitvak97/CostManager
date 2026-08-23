# Cost Manager RESTful Web Services

## Project Description

This project implements RESTful Web Services for managing users and cost items. The project uses Node.js, Express.js, Mongoose, MongoDB Atlas, Pino, Jest, and Supertest.

The application is divided into four independent microservices:

* Users
* Costs
* Logs
* About

## Microservices

### Users Service

Handles user-related operations.

URL:

https://cost-manager-users-2iy1.onrender.com

Endpoints:

* `GET /api/users` - Returns all users.
* `GET /api/users/:id` - Returns the details and total costs of a specific user.
* `POST /api/add` - Adds a new user.

### Costs Service

Handles cost-related operations.

URL:

https://cost-manager-costs-q518.onrender.com

Endpoints:

* `POST /api/add` - Adds a new cost item.
* `GET /api/report?id=USER_ID&year=YEAR&month=MONTH` - Returns the monthly report for a user.

The monthly report uses the Computed Design Pattern. Reports for past months are stored in MongoDB and reused on later requests.

### Logs Service

Handles log-related operations.

URL:

https://cost-manager-logs-apg1.onrender.com

Endpoint:

* `GET /api/logs` - Returns all stored logs.

Pino is used for logging HTTP requests and endpoint access. Log messages are stored in MongoDB.

### About Service

Handles information about the development team.

URL:

https://cost-manager-about-fidj.onrender.com

Endpoint:

* `GET /api/about` - Returns the first and last names of the development team members.

## Database

The project uses MongoDB Atlas.

The database contains the following main collections:

* `users`
* `costs`
* `logs`
* `reports`

The `users` collection contains the required user properties such as `id`, `first_name`, `last_name`, and `birthday`.

The `costs` collection contains `description`, `category`, `userid`, `sum`, and the cost date.

The supported cost categories are:

* `food`
* `health`
* `housing`
* `sports`
* `education`

## Environment Variables

The application uses environment variables through the `.env` file.

The `.env` file should not be committed to source control because it contains sensitive configuration such as the MongoDB connection string.

For deployment, the required environment variables are configured in the hosting service.

## Running the Project Locally

Install the project dependencies:

```bash
npm install
```

Start the four services separately:

```bash
npm run users
npm run costs
npm run logs
npm run about
```

The default local ports are:

* Users: `3001`
* Costs: `3002`
* Logs: `3003`
* About: `3004`

## Unit Tests

The project uses Jest and Supertest for unit testing.

Run all tests with:

```bash
npm test
```

The current test suite contains tests for all four microservices.

## Testing the Deployed Project

The project also includes the professor's Python testing script:

`professor_test.py`

The script can be configured with the four deployed microservice URLs and used to verify the deployed application.

## Project Structure

```text
costmanager/
├── about/
├── config/
├── costs/
├── logs/
├── middleware/
├── models/
├── tests/
├── users/
├── utils/
├── .gitignore
├── jest.config.js
├── package.json
├── package-lock.json
└── professor_test.py
```

## Notes

The four microservices are deployed as separate processes and have separate public URLs.

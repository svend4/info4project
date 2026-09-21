# Task Management API

A Node.js/Express-based Task Management System with comprehensive testing and CI/CD pipeline.

## Features

- RESTful API for task management
- Full CRUD operations (Create, Read, Update, Delete)
- Input validation and error handling
- Comprehensive unit tests with Jest
- Integration and E2E tests
- GitHub Actions CI/CD pipeline
- >80% code coverage

## Project Structure

```
backend/
├── src/
│   └── server.js           # Main Express application
├── tests/
│   ├── tasks.test.js       # Unit and integration tests
│   ├── e2e.test.js         # End-to-end tests
│   └── playwright/
│       └── api.spec.js     # Playwright API tests
├── jest.config.js          # Jest configuration
├── playwright.config.js    # Playwright configuration
├── package.json
└── README.md
```

## API Endpoints

### GET /api/tasks
Retrieve all tasks.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task Description",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /api/tasks
Create a new task.

**Request:**
```json
{
  "title": "Task Title",
  "description": "Optional description"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task Title",
    "description": "Optional description",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/tasks/:id
Retrieve a specific task.

**Response:** 200 OK (or 404 Not Found)

### PUT /api/tasks/:id
Update a task.

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "completed": true
}
```

**Response:** 200 OK

### DELETE /api/tasks/:id
Delete a task.

**Response:** 200 OK
```json
{
  "success": true,
  "data": { /* deleted task */ },
  "message": "Task deleted successfully"
}
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server will run on http://localhost:3000

## Testing

### Unit & Integration Tests
```bash
npm test
```

Runs Jest tests with coverage report. Coverage threshold is set to 80%.

### Watch Mode
```bash
npm run test:watch
```

### E2E Tests with Playwright
```bash
npm run test:e2e
```

### Test Coverage Report
After running tests, view the coverage report:
```bash
open coverage/lcov-report/index.html
```

## Test Coverage

The project includes:
- **Unit Tests**: Individual endpoint tests (22+ test cases)
- **Integration Tests**: API endpoint response validation
- **E2E Tests**: Complete task lifecycle flows
- **Error Handling**: Edge cases and validation errors

### Coverage Goals
- Lines: 80%+
- Functions: 80%+
- Branches: 80%+
- Statements: 80%+

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/test.yml` workflow:

1. **Triggers** on:
   - Push to main branch
   - Push to feature/* branches
   - Pull requests to main

2. **Steps**:
   - Checkout code
   - Setup Node.js 18
   - Install dependencies
   - Run tests with coverage
   - Upload coverage reports to Codecov
   - Archive coverage reports as artifacts
   - Verify coverage threshold (80%)
   - Generate test summary

3. **Status Checks**:
   - All tests must pass
   - Coverage must be > 80%

## Example Test Cases

### POST /api/tasks Tests
- ✓ Create task with title and description (201)
- ✓ Create task with title only
- ✓ Return 400 when title is missing
- ✓ Return 400 when title is empty

### GET /api/tasks Tests
- ✓ Retrieve all tasks (200)
- ✓ Return empty array when no tasks exist
- ✓ Validate response structure

### GET /api/tasks/:id Tests
- ✓ Retrieve specific task (200)
- ✓ Return 404 for non-existent ID
- ✓ Validate complete response structure

### PUT /api/tasks/:id Tests
- ✓ Update task with new values (200)
- ✓ Update only specific fields
- ✓ Update completion status
- ✓ Return 404 for non-existent ID
- ✓ Return 400 for empty title

### DELETE /api/tasks/:id Tests
- ✓ Delete task (200)
- ✓ Return 404 for non-existent ID
- ✓ Verify deletion from list

### E2E Flows
- ✓ Complete task lifecycle (create → read → update → delete)
- ✓ Multiple task management
- ✓ Error handling scenarios
- ✓ Data integrity through operations

## Dependencies

### Production
- **express**: Web framework
- **uuid**: Unique ID generation

### Development
- **jest**: Testing framework
- **supertest**: HTTP assertion library
- **@playwright/test**: End-to-end testing

## Environment Variables

Optional configuration:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## License

MIT

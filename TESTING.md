# StudySnap Backend Testing Documentation

This document outlines the testing strategy and procedures for the StudySnap backend application.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Testing Tools](#testing-tools)
3. [Types of Tests](#types-of-tests)
4. [Test Setup](#test-setup)
5. [Running Tests](#running-tests)
6. [Continuous Integration](#continuous-integration)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [Manual Testing Procedures](#manual-testing-procedures)

## Testing Strategy

Our testing approach follows a pyramid model with:

- **Unit Tests**: Fast, focused tests for individual functions and methods
- **Integration Tests**: Testing how components work together
- **API Tests**: Validating API endpoints behave as expected
- **End-to-End Tests**: Testing complete user flows
- **Performance Tests**: Ensuring the system handles expected load

### Test Coverage Goals

- Unit tests: 80%+ code coverage
- Integration tests: Cover all critical service interactions
- API tests: 100% coverage of all endpoints
- Performance tests: Validate handling 100 concurrent users

## Testing Tools

### Core Testing Framework

- **Jest**: Primary test runner and assertion library
- **Supertest**: HTTP assertions for API testing

### Mocking and Stubs

- **Nock**: HTTP request mocking
- **Sinon**: Function spies, stubs, and mocks
- **Mock-Service-Worker**: API mocking

### Performance Testing

- **Artillery**: Load and performance testing
- **Autocannon**: HTTP benchmarking

### Other Tools

- **Postman**: Manual API testing and collection creation
- **Istanbul/NYC**: Code coverage reporting
- **ESLint with Jest plugin**: Test code quality

## Types of Tests

### Unit Tests

Located in `__tests__/unit/` directory, following the structure of the src directory.

Example unit test for YouTube URL parsing:

```javascript
// __tests__/unit/services/youtubeService.test.js
const { extractVideoId } = require('../../../src/services/youtubeService');

describe('YouTube Service', () => {
  test('extracts video ID from standard URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });
  
  test('extracts video ID from shortened URL', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });
  
  test('returns null for invalid URL', () => {
    const url = 'https://example.com';
    expect(extractVideoId(url)).toBeNull();
  });
});
```

### Integration Tests

Located in `__tests__/integration/` directory, focusing on service interactions.

Example integration test for transcript service:

```javascript
// __tests__/integration/services/transcriptService.test.js
const { getTranscript } = require('../../../src/services/transcriptService');
const storageService = require('../../../src/services/storageService');

// Mock the external API
jest.mock('axios');

describe('Transcript Service Integration', () => {
  beforeEach(() => {
    // Clear cache between tests
    storageService.clear();
  });
  
  test('fetches and caches transcript', async () => {
    // Mock API response
    require('axios').mockResolvedValueOnce({
      data: { transcript: 'Test transcript', title: 'Test Video' }
    });
    
    const result = await getTranscript('dQw4w9WgXcQ');
    
    // Verify response
    expect(result).toHaveProperty('transcript', 'Test transcript');
    
    // Verify it's cached
    expect(storageService.get('dQw4w9WgXcQ')).toBeTruthy();
  });
});
```

### API Tests

Located in `__tests__/api/` directory, testing complete API endpoints.

Example API test:

```javascript
// __tests__/api/transcript.test.js
const request = require('supertest');
const app = require('../../src/app');
const nock = require('nock');

describe('Transcript API', () => {
  test('POST /api/transcript returns transcript data', async () => {
    // Mock external API
    nock('https://api.supadata.api')
      .post('/v1/youtube/transcript')
      .reply(200, {
        content: 'Mocked transcript content',
        title: 'Test Video'
      });
      
    const response = await request(app)
      .post('/api/transcript')
      .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('transcript');
    expect(response.body.data).toHaveProperty('videoId', 'dQw4w9WgXcQ');
  });
  
  test('POST /api/transcript with invalid URL returns 400', async () => {
    const response = await request(app)
      .post('/api/transcript')
      .send({ url: 'invalid-url' });
      
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### LLM Integration Tests

Tests for LLM service integrations should use recorded responses to avoid actual API calls:

```javascript
// __tests__/integration/services/llm/geminiService.test.js
const { generateNotes } = require('../../../../src/services/llm/geminiService');
const mockResponses = require('../../../mocks/geminiResponses');

// Mock the Gemini API client
jest.mock('@google/generative-ai', () => {
  return {
    GenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: jest.fn().mockResolvedValue(mockResponses.notesResponse)
    }))
  };
});

describe('Gemini Service', () => {
  test('generates notes from transcript', async () => {
    const transcript = 'This is a test transcript';
    const result = await generateNotes(transcript);
    
    expect(result).toContain('Chapter 1');
    expect(result).toContain('Key Learning Points');
  });
});
```

## Test Setup

### Environment Setup

Create a `jest.config.js` file:

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./jest.setup.js']
};
```

Create a `jest.setup.js` file for global test setup:

```javascript
// Set test environment
process.env.NODE_ENV = 'test';

// Load environment variables from .env.test
require('dotenv').config({ path: '.env.test' });

// Global setup
jest.setTimeout(10000); // 10 second timeout
```

Create a `.env.test` file:

```
# Test configuration
PORT=3001
LLM_PROVIDER=gemini
GEMINI_API_KEY=test-api-key
TRANSCRIPT_API_KEY=test-api-key
```

## Running Tests

Add scripts to package.json:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:unit": "jest --testPathPattern=__tests__/unit",
  "test:integration": "jest --testPathPattern=__tests__/integration",
  "test:api": "jest --testPathPattern=__tests__/api",
  "test:e2e": "jest --testPathPattern=__tests__/e2e"
}
```

### Running specific tests:

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run specific test file
npx jest __tests__/api/transcript.test.js
```

## Continuous Integration

Set up CI pipeline using GitHub Actions by creating `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests with coverage
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
```

## Performance Testing

Create a performance test using Artillery in `tests/performance/basic-load.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 20
      name: "Warm up phase"
    - duration: 120
      arrivalRate: 20
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Transcript and notes generation"
    flow:
      - post:
          url: "/api/transcript"
          json:
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          capture:
            - json: "$.data.transcript"
              as: "transcript"
            - json: "$.data.videoId"
              as: "videoId"
      
      - post:
          url: "/api/notes"
          json:
            videoId: "{{ videoId }}"
            transcript: "{{ transcript }}"
```

Run performance tests with:

```bash
# Install artillery
npm install -g artillery

# Run the test
artillery run tests/performance/basic-load.yml
```

## Security Testing

### Dependency Scanning

Add security scanning to package.json:

```json
"scripts": {
  "security:check": "npm audit --audit-level=high",
  "security:fix": "npm audit fix"
}
```

### OWASP ZAP Scanning

Run OWASP ZAP scans against your API to check for common vulnerabilities:

```bash
# Using Docker
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

## Manual Testing Procedures

### API Endpoint Testing with Postman

1. Import the Postman collection from `docs/StudySnap.postman_collection.json`
2. Set up environment variables:
   - `baseUrl`: Your local or staging API URL
   - `youtubeUrl`: A valid YouTube URL for testing

3. Test the transcript endpoint:
   - Send POST request to `/api/transcript`
   - Verify successful response with transcript data

4. Test the notes generation:
   - Send POST request to `/api/notes`
   - Verify well-structured markdown notes are returned

5. Test error handling:
   - Send requests with invalid parameters
   - Verify appropriate error responses

### Validating LLM Output

1. For each LLM-based endpoint, verify:
   - Response format matches API specification
   - Content is properly structured (chapters, mindmap format, etc.)
   - No harmful content is generated

2. Test with various video types:
   - Short videos (1-5 minutes)
   - Medium videos (10-20 minutes)
   - Long videos (30+ minutes)
   - Different content domains (educational, entertainment, etc.)

### Session Handling Testing

1. Test with session identifier:
   - Make transcript request with sessionId
   - Make subsequent requests with same sessionId
   - Verify transcript is not fetched again

2. Test session expiry:
   - Make request with sessionId
   - Wait 31 minutes (beyond TTL)
   - Verify transcript is fetched again

## Troubleshooting Tests

### Common Issues

1. **API Mocking Problems**:
   - Ensure nock interceptors are properly set up
   - Check that interceptors are consumed or cleaned up after tests

2. **Timeout Issues**:
   - Increase timeout for specific tests that work with external APIs
   - Use `jest.setTimeout(milliseconds)` in the test file

3. **Test Isolation**:
   - Ensure beforeEach/afterEach hooks properly clean up state
   - Watch for shared state between tests

### Debugging Failed Tests

1. Run test with verbose flag:
   ```bash
   npx jest --verbose __tests__/path/to/test.js
   ```

2. Add console logs in tests temporarily:
   ```javascript
   console.log(JSON.stringify(response.body, null, 2));
   ```

3. Run a single test with `.only`:
   ```javascript
   test.only('specific test case', () => { ... });
   ``` 
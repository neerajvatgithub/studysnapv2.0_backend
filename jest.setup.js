// Set test environment
process.env.NODE_ENV = 'test';

// Load environment variables from .env.test if exists
require('dotenv').config({ path: '.env.test' });

// Global setup
jest.setTimeout(10000); // 10 second timeout 
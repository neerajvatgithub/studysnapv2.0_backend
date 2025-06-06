/**
 * API Test Script
 * Tests the API endpoints with authentication
 */
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Config
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Test YouTube video
const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Get a Supabase JWT token for testing
 * @returns {Promise<string>} JWT token
 */
async function getTestToken() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(`${colors.red}Error: Supabase credentials missing in .env file${colors.reset}`);
    console.log(`Add the following to your .env file:
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
    `);
    process.exit(1);
  }
  
  // Test email and password - ONLY FOR TESTING!
  const TEST_EMAIL = process.env.TEST_EMAIL;
  const TEST_PASSWORD = process.env.TEST_PASSWORD;
  
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.error(`${colors.red}Error: Test credentials missing in .env file${colors.reset}`);
    console.log(`Add the following to your .env file:
TEST_EMAIL=your-test-email
TEST_PASSWORD=your-test-password
    `);
    process.exit(1);
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log(`${colors.blue}Authenticating with Supabase...${colors.reset}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    console.log(`${colors.green}Authentication successful!${colors.reset}`);
    return data.session.access_token;
  } catch (error) {
    console.error(`${colors.red}Error getting JWT token: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Make an authenticated API request
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(method, endpoint, data, token) {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`${colors.blue}Making ${method} request to ${url}${colors.reset}`);
    
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`${colors.red}API Error: ${error.response.status} ${JSON.stringify(error.response.data)}${colors.reset}`);
    } else {
      console.error(`${colors.red}Request Error: ${error.message}${colors.reset}`);
    }
    throw error;
  }
}

/**
 * Run the tests
 */
async function runTests() {
  try {
    // Get JWT token
    const token = await getTestToken();
    
    // Test 1: Get transcript
    console.log(`\n${colors.magenta}Test 1: Get transcript${colors.reset}`);
    const transcriptResponse = await apiRequest('post', '/transcript', {
      url: TEST_VIDEO_URL
    }, token);
    
    console.log(`${colors.green}✓ Transcript API call successful${colors.reset}`);
    console.log(`Video title: ${transcriptResponse.data.title}`);
    console.log(`Transcript length: ${transcriptResponse.data.transcript.length} characters`);
    
    // Test 2: Get history
    console.log(`\n${colors.magenta}Test 2: Get history${colors.reset}`);
    const historyResponse = await apiRequest('get', '/history', null, token);
    
    console.log(`${colors.green}✓ History API call successful${colors.reset}`);
    console.log(`Total items: ${historyResponse.data.total || historyResponse.data.items.length}`);
    console.log(`Latest item: ${JSON.stringify(historyResponse.data.items[0], null, 2)}`);
    
    // Test 3: Get history stats
    console.log(`\n${colors.magenta}Test 3: Get history stats${colors.reset}`);
    const statsResponse = await apiRequest('get', '/history/stats', null, token);
    
    console.log(`${colors.green}✓ History stats API call successful${colors.reset}`);
    console.log(`Stats: ${JSON.stringify(statsResponse.data, null, 2)}`);
    
    console.log(`\n${colors.green}All tests completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Test failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
runTests(); 
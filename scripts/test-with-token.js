/**
 * API Test Script
 * Tests the API endpoints with a provided JWT token
 */
require('dotenv').config();
const axios = require('axios');

// Test video URL
const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// API config
const API_URL = 'http://localhost:3000/api';

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

async function runTests(token) {
  if (!token) {
    console.error(`${colors.red}Error: No token provided${colors.reset}`);
    console.error(`${colors.yellow}Usage: node scripts/test-with-token.js YOUR_JWT_TOKEN${colors.reset}`);
    process.exit(1);
  }
  
  try {
    // Test health endpoint (non-authenticated)
    console.log(`${colors.blue}Testing health endpoint...${colors.reset}`);
    const healthResponse = await axios({
      method: 'get',
      url: `${API_URL.replace('/api', '')}/health`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`${colors.green}✓ Health check successful${colors.reset}`);
    console.log(`Response status: ${healthResponse.status}`);
    
    // Test history endpoint (authenticated)
    console.log(`\n${colors.blue}Testing history endpoint...${colors.reset}`);
    try {
      const historyResponse = await axios({
        method: 'get',
        url: `${API_URL}/history`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${colors.green}✓ History API call successful${colors.reset}`);
      console.log(`Response status: ${historyResponse.status}`);
      console.log(`Items count: ${historyResponse.data.data.items?.length || 0}`);
      console.log(`Response data: ${JSON.stringify(historyResponse.data, null, 2)}`);
    } catch (error) {
      console.error(`${colors.red}✗ History API call failed${colors.reset}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`Error: ${error.message}`);
      }
    }
    
    // Test token check (user profile)
    console.log(`\n${colors.blue}Testing token balance...${colors.reset}`);
    try {
      const tokenResponse = await axios({
        method: 'get',
        url: `${API_URL}/history/stats`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${colors.green}✓ Stats API call successful${colors.reset}`);
      console.log(`Response status: ${tokenResponse.status}`);
      console.log(`Response data: ${JSON.stringify(tokenResponse.data, null, 2)}`);
    } catch (error) {
      console.error(`${colors.red}✗ Stats API call failed${colors.reset}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`Error: ${error.message}`);
      }
    }
    
    console.log(`\n${colors.green}Testing complete!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Get token from command line arguments
const token = process.argv[2];

// Run the tests
runTests(token); 
/**
 * API Test Script (Token from File)
 * Tests the API endpoints with a JWT token from a file
 */
require('dotenv').config();
const fs = require('fs');
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

async function runTests() {
  try {
    // Read token from file
    console.log(`${colors.blue}Reading token from file...${colors.reset}`);
    const token = fs.readFileSync('./scripts/token.txt', 'utf8').trim();
    
    if (!token) {
      throw new Error('No token found in token.txt file');
    }
    
    console.log(`${colors.green}Successfully read token${colors.reset}`);
    
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
    console.log(`\n${colors.blue}Testing stats endpoint...${colors.reset}`);
    try {
      const statsResponse = await axios({
        method: 'get',
        url: `${API_URL}/history/stats`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${colors.green}✓ Stats API call successful${colors.reset}`);
      console.log(`Response status: ${statsResponse.status}`);
      console.log(`Response data: ${JSON.stringify(statsResponse.data, null, 2)}`);
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

// Run the tests
runTests(); 
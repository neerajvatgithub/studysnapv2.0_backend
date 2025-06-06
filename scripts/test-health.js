/**
 * Health Check Test Script
 * Tests the basic health endpoint of the API
 */
require('dotenv').config();
const axios = require('axios');

// API config
const API_URL = 'http://localhost:3000';

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

async function testHealth() {
  try {
    console.log(`${colors.blue}Testing API health endpoint...${colors.reset}`);
    
    const response = await axios({
      method: 'get',
      url: `${API_URL}/health`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`${colors.green}✓ Health endpoint test successful${colors.reset}`);
    console.log(`Response status: ${response.status}`);
    console.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
    
    console.log(`\n${colors.green}API server is running correctly!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Health endpoint test failed${colors.reset}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run the health check
testHealth(); 
/**
 * Test Authentication Headers
 * 
 * This script tests different approaches to Supabase authentication headers:
 * 1. Just the Authorization header (current implementation)
 * 2. Both Authorization + apikey headers (as per Supabase docs)
 */
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
let token;

// ANSI color codes for terminal output
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
 * Reads the JWT token from the token file
 */
function getToken() {
  try {
    return fs.readFileSync('./scripts/token.txt', 'utf8').trim();
  } catch (error) {
    console.error(`${colors.red}Failed to read token from file: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Test API endpoint with just the Authorization header
 */
async function testWithAuthOnly() {
  console.log(`\n${colors.magenta}Testing with Authorization header only...${colors.reset}`);
  
  try {
    const response = await axios.get(`${API_URL}/debug-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`${colors.green}✓ Request successful! Status code: ${response.status}${colors.reset}`);
    console.log(`${colors.blue}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Request failed! Status code: ${error.response?.status || 'unknown'}${colors.reset}`);
    if (error.response?.data) {
      console.log(`${colors.red}Error response:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

/**
 * Test API endpoint with both Authorization and apikey headers
 */
async function testWithAuthAndApiKey() {
  console.log(`\n${colors.magenta}Testing with both Authorization and apikey headers...${colors.reset}`);
  
  try {
    const response = await axios.get(`${API_URL}/debug-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    console.log(`${colors.green}✓ Request successful! Status code: ${response.status}${colors.reset}`);
    console.log(`${colors.blue}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Request failed! Status code: ${error.response?.status || 'unknown'}${colors.reset}`);
    if (error.response?.data) {
      console.log(`${colors.red}Error response:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

/**
 * Test accessing a protected endpoint
 */
async function testProtectedEndpoint() {
  console.log(`\n${colors.magenta}Testing protected endpoint (history)...${colors.reset}`);
  
  try {
    const response = await axios.get(`${API_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    console.log(`${colors.green}✓ Protected endpoint access successful! Status code: ${response.status}${colors.reset}`);
    console.log(`${colors.blue}Response:${colors.reset}`, JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Protected endpoint access failed! Status code: ${error.response?.status || 'unknown'}${colors.reset}`);
    if (error.response?.data) {
      console.log(`${colors.red}Error response:${colors.reset}`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}Starting Supabase authentication headers test...${colors.reset}`);
  
  // Get the token
  token = getToken();
  if (!token) {
    console.log(`${colors.red}No token available. Please generate a token first.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Using token (first 15 chars): ${token.substring(0, 15)}...${colors.reset}`);
  console.log(`${colors.blue}Using Supabase Anon Key (first 10 chars): ${SUPABASE_ANON_KEY.substring(0, 10)}...${colors.reset}`);
  
  // Run the tests
  const authOnlyResult = await testWithAuthOnly();
  const authAndApiKeyResult = await testWithAuthAndApiKey();
  
  if (authOnlyResult || authAndApiKeyResult) {
    // Only test protected endpoint if at least one auth method worked
    await testProtectedEndpoint();
  }
  
  // Summary
  console.log(`\n${colors.magenta}Test Summary:${colors.reset}`);
  console.log(`${colors.blue}Authorization header only: ${authOnlyResult ? colors.green + '✓ Passed' : colors.red + '✗ Failed'}${colors.reset}`);
  console.log(`${colors.blue}Authorization + apikey headers: ${authAndApiKeyResult ? colors.green + '✓ Passed' : colors.red + '✗ Failed'}${colors.reset}`);
}

// Run the main function
main()
  .then(() => {
    console.log(`\n${colors.green}Authentication header test completed.${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n${colors.red}Error running tests: ${error.message}${colors.reset}`);
    process.exit(1);
  }); 
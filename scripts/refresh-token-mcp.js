/**
 * Refresh Token using MCP API
 * 
 * This script uses the Supabase Management API to generate a fresh token
 */
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Configuration
const MCP_ACCESS_TOKEN = 'sbp_452ec9ef77bcaf33149fed92e0de758e294a03cc'; // From your mcp.json file
const SUPABASE_PROJECT_REF = 'unkcqffyuweicumuztro'; // From your Supabase URL
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'testpassword123'; // You might need to change this

// Color formatting
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
 * Generate a token using the Supabase Management API
 */
async function generateToken() {
  try {
    console.log(`${colors.blue}Attempting to generate token for user: ${TEST_EMAIL}${colors.reset}`);
    
    // First try to get the user to make sure they exist
    console.log(`${colors.blue}Verifying user exists...${colors.reset}`);
    
    // Create auth admin client for the project
    const authUrl = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/auth/users`;
    
    // Get users to check if our test user exists
    const usersResponse = await axios.get(authUrl, {
      headers: {
        'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        email: TEST_EMAIL
      }
    });
    
    const users = usersResponse.data.users || [];
    
    if (users.length === 0) {
      console.log(`${colors.yellow}User with email ${TEST_EMAIL} not found. Creating...${colors.reset}`);
      
      // Create a new user
      const createResponse = await axios.post(authUrl, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true
      }, {
        headers: {
          'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${colors.green}✅ User created successfully${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ User exists${colors.reset}`);
    }
    
    // Now sign in with the user to get a token
    console.log(`${colors.blue}Signing in with user credentials...${colors.reset}`);
    
    // Use the auth endpoint of your Supabase project
    const signInUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/token?grant_type=password`;
    
    const signInResponse = await axios.post(signInUrl, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (signInResponse.data && signInResponse.data.access_token) {
      const token = signInResponse.data.access_token;
      console.log(`${colors.green}✅ Successfully generated token${colors.reset}`);
      console.log(`${colors.blue}Token (first 20 chars): ${token.substring(0, 20)}...${colors.reset}`);
      
      // Save token to file
      fs.writeFileSync('./scripts/token.txt', token);
      console.log(`${colors.green}✅ Token saved to scripts/token.txt${colors.reset}`);
      
      return token;
    } else {
      console.log(`${colors.red}❌ Failed to get token${colors.reset}`);
      console.log(signInResponse.data);
      return null;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (error.response) {
      console.error(`${colors.red}Response status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}Response data: ${JSON.stringify(error.response.data, null, 2)}${colors.reset}`);
    }
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.magenta}Refreshing Supabase token...${colors.reset}`);
  
  const token = await generateToken();
  
  if (token) {
    console.log(`${colors.green}✅ Token refresh successful!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Token refresh failed.${colors.reset}`);
  }
}

// Run the main function
main()
  .catch(error => {
    console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  }); 
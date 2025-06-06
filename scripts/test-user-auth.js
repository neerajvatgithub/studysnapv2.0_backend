/**
 * Test User Authentication with Headers
 * This script tests Supabase authentication with both Authorization and apikey headers
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

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

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const API_URL = 'http://localhost:3000';

// Test user credentials
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'StudySnap123!';

async function testUserAuth() {
  console.log(`${colors.blue}Initializing Supabase client...${colors.reset}`);
  
  // Initialize Supabase client with anon key
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Sign in with test user
    console.log(`${colors.blue}Attempting to sign in with test user...${colors.reset}`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      console.error(`${colors.red}Sign-in failed: ${signInError.message}${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`${colors.green}Sign-in successful!${colors.reset}`);
    console.log(`${colors.green}User ID: ${signInData.user.id}${colors.reset}`);
    
    // Get the access token and refresh token
    const accessToken = signInData.session.access_token;
    
    console.log(`${colors.cyan}Access Token (first 20 chars): ${accessToken.substring(0, 20)}...${colors.reset}`);
    
         // Test the API endpoint with both Authorization and apikey headers
     console.log(`\n${colors.blue}Testing API endpoint with both headers...${colors.reset}`);
     try {
       const response = await axios({
         method: 'get',
         url: `${API_URL}/api/debug-auth`,
         headers: {
           'Authorization': `Bearer ${accessToken}`,
           'apikey': SUPABASE_ANON_KEY,
           'Content-Type': 'application/json'
         }
       });
      
      console.log(`${colors.green}API request successful!${colors.reset}`);
      console.log(`${colors.cyan}Response status: ${response.status}${colors.reset}`);
      console.log(`${colors.cyan}Response data:${colors.reset}`, response.data);
    } catch (apiError) {
      console.error(`${colors.red}API request failed:${colors.reset}`, apiError.response ? apiError.response.data : apiError.message);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Run the test
testUserAuth(); 
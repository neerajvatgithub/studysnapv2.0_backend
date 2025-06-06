/**
 * Direct Test Script
 * Tests the API directly with Supabase integration
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Test video URL
const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// API and Supabase config
const API_URL = 'http://localhost:3000/api';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

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

async function runTest() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(`${colors.red}Error: Supabase credentials missing in .env file${colors.reset}`);
    process.exit(1);
  }
  
  try {
    // Initialize Supabase client with service key
    console.log(`${colors.blue}Initializing Supabase client...${colors.reset}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Get a user to test with
    console.log(`${colors.blue}Getting test user...${colors.reset}`);
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      throw new Error(`Failed to get test user: ${userError?.message || 'No users found'}`);
    }
    
    const userId = users[0].id;
    console.log(`${colors.green}Using user ID: ${userId}${colors.reset}`);
    
    // Get user auth data
    const { data: auth, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      throw new Error(`Failed to get user auth data: ${authError.message}`);
    }
    
    console.log(`${colors.green}Got user: ${auth.user.email}${colors.reset}`);
    
    // Generate a JWT token directly (alternative to createSession)
    console.log(`${colors.blue}Generating token for user...${colors.reset}`);
    
    // Using signInWithPassword if the user has a password set
    // Note: In a real app, you wouldn't hardcode credentials
    // This is just for testing - replace with your test user's email/password
    const testUserEmail = auth.user.email;
    const testUserPassword = 'testpassword123'; // Replace with your test user's password
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    });
    
    if (signInError) {
      // Fallback: use a service role JWT generation
      console.log(`${colors.yellow}Sign-in failed. Using service role token instead.${colors.reset}`);
      
      // For testing purposes, we'll use the service key as a JWT (not recommended for production)
      const token = SUPABASE_SERVICE_KEY;
      console.log(`${colors.green}Using service role token for authentication${colors.reset}`);
      
      // Test API endpoints with the service token
      await testApiEndpoints(token);
    } else {
      console.log(`${colors.green}Successfully signed in as ${testUserEmail}${colors.reset}`);
      const token = signInData.session.access_token;
      console.log(`${colors.green}Generated user token${colors.reset}`);
      
      // Test API endpoints with the user token
      await testApiEndpoints(token);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

async function testApiEndpoints(token) {
  // Test API endpoints
  console.log(`\n${colors.magenta}Testing API endpoints...${colors.reset}`);
  
  // Test transcript endpoint
  console.log(`\n${colors.magenta}Test 1: Get transcript${colors.reset}`);
  try {
    const response = await axios({
      method: 'post',
      url: `${API_URL}/transcript`,
      data: {
        url: TEST_VIDEO_URL
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`${colors.green}✓ Transcript API call successful${colors.reset}`);
    console.log(`Response status: ${response.status}`);
    console.log(`Video title: ${response.data.data.title || 'N/A'}`);
    console.log(`Transcript length: ${response.data.data.transcript?.length || 0} characters`);
  } catch (error) {
    console.error(`${colors.red}✗ Transcript API call failed${colors.reset}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
  
  // Test history endpoint
  console.log(`\n${colors.magenta}Test 2: Get history${colors.reset}`);
  try {
    const response = await axios({
      method: 'get',
      url: `${API_URL}/history`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`${colors.green}✓ History API call successful${colors.reset}`);
    console.log(`Response status: ${response.status}`);
    console.log(`Items count: ${response.data.data.items?.length || 0}`);
    if (response.data.data.items?.length > 0) {
      console.log(`Latest item: ${JSON.stringify(response.data.data.items[0], null, 2)}`);
    }
  } catch (error) {
    console.error(`${colors.red}✗ History API call failed${colors.reset}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
  
  console.log(`\n${colors.green}Testing complete!${colors.reset}`);
}

// Run the test
runTest(); 
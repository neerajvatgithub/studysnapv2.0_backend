/**
 * Create Test Account Script
 * Creates a test user account in Supabase for API testing
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Test user credentials
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'StudySnap123!';

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

async function createTestAccount() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(`${colors.red}Error: Supabase credentials missing in .env file${colors.reset}`);
    process.exit(1);
  }
  
  try {
    // Initialize Supabase client with service key
    console.log(`${colors.blue}Initializing Supabase client...${colors.reset}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Try to sign in first (in case user already exists)
    console.log(`${colors.blue}Attempting to sign in...${colors.reset}`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (!signInError && signInData?.session) {
      console.log(`${colors.green}Successfully signed in with existing user${colors.reset}`);
      console.log(`${colors.green}User ID: ${signInData.user.id}${colors.reset}`);
      console.log(`${colors.cyan}Access Token: ${signInData.session.access_token}${colors.reset}`);
      console.log(`${colors.cyan}Refresh Token: ${signInData.session.refresh_token}${colors.reset}`);
      
      // Test the token with a direct API call
      await testToken(signInData.session.access_token);
      
      return;
    }
    
    console.log(`${colors.yellow}Sign-in failed: ${signInError?.message || 'Unknown error'}${colors.reset}`);
    console.log(`${colors.blue}Creating new user or resetting password...${colors.reset}`);
    
    // Try password reset as an alternative (if the user exists but we can't sign in)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(TEST_EMAIL);
    if (!resetError) {
      console.log(`${colors.green}Password reset email sent to ${TEST_EMAIL}${colors.reset}`);
      console.log(`${colors.yellow}Please check your email and set a new password${colors.reset}`);
      console.log(`${colors.yellow}Then run this script again to sign in${colors.reset}`);
      return;
    }
    
    console.log(`${colors.blue}Creating new test user...${colors.reset}`);
    
    // Create new test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          full_name: 'API Test User',
        }
      }
    });
    
    if (signUpError) {
      throw new Error(`Failed to create test user: ${signUpError.message}`);
    }
    
    console.log(`${colors.green}Successfully created test user${colors.reset}`);
    console.log(`${colors.green}User ID: ${signUpData.user?.id || 'Unknown'}${colors.reset}`);
    
    // Check if we have a session
    if (signUpData.session) {
      console.log(`${colors.green}Session created successfully${colors.reset}`);
      console.log(`${colors.cyan}Access Token: ${signUpData.session.access_token}${colors.reset}`);
      console.log(`${colors.cyan}Refresh Token: ${signUpData.session.refresh_token}${colors.reset}`);
      
      // Test the token
      await testToken(signUpData.session.access_token);
    } else {
      console.log(`${colors.yellow}Email confirmation required before login${colors.reset}`);
      console.log(`${colors.yellow}Please check your email and confirm your account${colors.reset}`);
      console.log(`${colors.yellow}Then run this script again to sign in${colors.reset}`);
    }
    
    // Wait a moment for the trigger to create the profile
    if (signUpData.user?.id) {
      console.log(`${colors.blue}Waiting for profile creation...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update tokens if we have a user ID
      console.log(`${colors.blue}Setting up user profile with tokens...${colors.reset}`);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          tokens_remaining: 100,
          subscription_tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', signUpData.user.id);
      
      if (profileError) {
        console.log(`${colors.yellow}Warning: Could not update profile: ${profileError.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}Successfully set up user profile with tokens${colors.reset}`);
      }
    }
    
    console.log(`\n${colors.magenta}Test user setup complete${colors.reset}`);
    console.log(`${colors.magenta}Email: ${TEST_EMAIL}${colors.reset}`);
    console.log(`${colors.magenta}Password: ${TEST_PASSWORD}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Test a token by making an API call
async function testToken(token) {
  try {
    const axios = require('axios');
    console.log(`${colors.blue}Testing token with API health endpoint...${colors.reset}`);
    
    const response = await axios({
      method: 'get',
      url: 'http://localhost:3000/health',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`${colors.green}✓ API health check successful with token${colors.reset}`);
    console.log(`Response status: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Token validation failed${colors.reset}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    return false;
  }
}

// Run the account creator
createTestAccount(); 
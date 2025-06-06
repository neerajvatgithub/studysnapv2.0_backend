/**
 * Refresh Token Using Supabase JS
 * 
 * This script uses the Supabase JS client to generate a fresh token
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'testpassword123';

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
 * Initialize Supabase client
 */
console.log(`${colors.blue}Initializing Supabase client...${colors.reset}`);
console.log(`${colors.blue}URL: ${SUPABASE_URL}${colors.reset}`);
console.log(`${colors.blue}Anon Key (first 10 chars): ${SUPABASE_ANON_KEY.substring(0, 10)}...${colors.reset}`);

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Create a new user if needed
 */
async function createUserIfNeeded() {
  try {
    console.log(`\n${colors.magenta}Checking if user needs to be created...${colors.reset}`);
    
    // Try signing in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    // If sign in succeeds, user exists
    if (!signInError && signInData?.user) {
      console.log(`${colors.green}✅ User exists and credentials are valid${colors.reset}`);
      return signInData;
    }
    
    // If sign in fails with "Invalid login credentials", we'll try to create the user
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log(`${colors.yellow}⚠️ Invalid credentials, trying to create user...${colors.reset}`);
      
      // Create a new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });
      
      if (signUpError) {
        console.log(`${colors.red}❌ Failed to create user: ${signUpError.message}${colors.reset}`);
        return null;
      }
      
      console.log(`${colors.green}✅ User created successfully${colors.reset}`);
      return signUpData;
    }
    
    // Some other error occurred during sign in
    console.log(`${colors.red}❌ Error checking user: ${signInError.message}${colors.reset}`);
    return null;
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Sign in and get a fresh token
 */
async function signInAndGetToken() {
  try {
    console.log(`\n${colors.magenta}Signing in to get fresh token...${colors.reset}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.log(`${colors.red}❌ Sign-in failed: ${error.message}${colors.reset}`);
      return null;
    }
    
    const token = data.session.access_token;
    console.log(`${colors.green}✅ Sign-in successful!${colors.reset}`);
    console.log(`${colors.green}✅ Token received (first 20 chars): ${token.substring(0, 20)}...${colors.reset}`);
    
    // Save token to file
    fs.writeFileSync('./scripts/token.txt', token);
    console.log(`${colors.green}✅ Token saved to scripts/token.txt${colors.reset}`);
    
    return token;
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Inspect token without verification
 */
function inspectToken(token) {
  try {
    console.log(`\n${colors.magenta}Inspecting token...${colors.reset}`);
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log(`${colors.red}❌ Invalid token format${colors.reset}`);
      return;
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    console.log(`${colors.blue}Token payload:${colors.reset}`);
    console.log(`  Subject (sub): ${payload.sub}`);
    console.log(`  Role: ${payload.role}`);
    console.log(`  Expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
    console.log(`  Issued at: ${new Date(payload.iat * 1000).toLocaleString()}`);
    console.log(`  Session ID: ${payload.session_id}`);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log(`${colors.red}❌ Warning: Token is expired!${colors.reset}`);
    } else {
      const timeLeft = payload.exp - now;
      const daysLeft = Math.floor(timeLeft / 86400);
      const hoursLeft = Math.floor((timeLeft % 86400) / 3600);
      const minutesLeft = Math.floor((timeLeft % 3600) / 60);
      
      console.log(`${colors.green}✅ Token is valid for approximately ${daysLeft} days, ${hoursLeft} hours, and ${minutesLeft} minutes${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error inspecting token: ${error.message}${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.magenta}Refreshing Supabase token...${colors.reset}`);
  
  // First create the user if needed
  await createUserIfNeeded();
  
  // Then sign in to get a token
  const token = await signInAndGetToken();
  
  if (token) {
    inspectToken(token);
    console.log(`\n${colors.green}✅ Token refresh successful!${colors.reset}`);
    
    // Display how to use the token
    console.log(`\n${colors.magenta}To use this token:${colors.reset}`);
    console.log(`${colors.blue}1. Include the Authorization header:${colors.reset}`);
    console.log(`   Authorization: Bearer ${token.substring(0, 20)}...`);
    console.log(`${colors.blue}2. Include the apikey header:${colors.reset}`);
    console.log(`   apikey: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  } else {
    console.log(`\n${colors.red}❌ Token refresh failed${colors.reset}`);
  }
}

// Run the main function
main()
  .catch(error => {
    console.error(`${colors.red}❌ Unhandled error: ${error.message}${colors.reset}`);
  }); 
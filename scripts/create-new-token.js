/**
 * Create New Supabase Token
 * 
 * This script generates a fresh JWT token from Supabase
 * for testing authentication.
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
    persistSession: false,
    detectSessionInUrl: false
  }
});

/**
 * Sign in and get token
 */
async function signInAndGetToken() {
  try {
    console.log(`\n${colors.magenta}Signing in with email: ${TEST_EMAIL}${colors.reset}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.log(`${colors.red}Sign-in failed: ${error.message}${colors.reset}`);
      return null;
    }
    
    console.log(`${colors.green}Sign-in successful!${colors.reset}`);
    console.log(`${colors.blue}User ID: ${data.user.id}${colors.reset}`);
    console.log(`${colors.blue}User Email: ${data.user.email}${colors.reset}`);
    
    // Get token
    const token = data.session.access_token;
    console.log(`${colors.green}Token received! (first 15 chars): ${token.substring(0, 15)}...${colors.reset}`);
    
    // Save token to file
    fs.writeFileSync('./scripts/token.txt', token);
    console.log(`${colors.green}Token saved to scripts/token.txt${colors.reset}`);
    
    return token;
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Inspect token without verification
 */
function inspectToken(token) {
  try {
    console.log(`\n${colors.magenta}Inspecting token (without verification)...${colors.reset}`);
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log(`${colors.red}Invalid token format.${colors.reset}`);
      return;
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    console.log(`${colors.blue}Token payload:${colors.reset}`);
    console.log(`  Subject (sub): ${payload.sub}`);
    console.log(`  Issuer (iss): ${payload.iss}`);
    console.log(`  Expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
    console.log(`  Issued at: ${new Date(payload.iat * 1000).toLocaleString()}`);
    console.log(`  Role: ${payload.role}`);
    console.log(`  Session ID: ${payload.session_id}`);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log(`${colors.red}Warning: Token is expired!${colors.reset}`);
    } else {
      const timeLeft = payload.exp - now;
      const daysLeft = Math.floor(timeLeft / 86400);
      const hoursLeft = Math.floor((timeLeft % 86400) / 3600);
      const minutesLeft = Math.floor((timeLeft % 3600) / 60);
      
      console.log(`${colors.green}Token is valid for approximately ${daysLeft} days, ${hoursLeft} hours, and ${minutesLeft} minutes.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error inspecting token: ${error.message}${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}Creating a new Supabase token...${colors.reset}`);
  
  const token = await signInAndGetToken();
  
  if (token) {
    inspectToken(token);
    console.log(`\n${colors.green}Token creation successful! You can now use this token for API testing.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}Failed to create token.${colors.reset}`);
  }
}

// Run the main function
main()
  .catch((error) => {
    console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  }); 
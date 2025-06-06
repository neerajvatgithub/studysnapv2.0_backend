/**
 * Token Generator Script
 * Creates a valid JWT token for API testing
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase config
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

async function generateToken() {
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
    
    // Create a new user session directly
    console.log(`${colors.blue}Creating JWT token...${colors.reset}`);
    
    // Method 1: Try to sign in as the user (for development, you might need to set a password)
    const testEmail = 'test@example.com'; // Replace with a test user email
    const testPassword = 'password123'; // Replace with a test password
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (!signInError && signInData.session) {
      console.log(`${colors.green}Successfully generated token via sign in${colors.reset}`);
      console.log(`${colors.cyan}Token: ${signInData.session.access_token}${colors.reset}`);
      return;
    }
    
    console.log(`${colors.yellow}Sign-in failed: ${signInError?.message}${colors.reset}`);
    
    // Method 2: Create a custom JWT - this is for demonstration only
    // In a real app, you would authenticate properly
    console.log(`${colors.blue}Attempting alternative token generation...${colors.reset}`);
    
    // Try to create a new user for testing
    const tempEmail = `test-${Date.now()}@example.com`;
    const tempPassword = 'Password123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword
    });
    
    if (signUpError) {
      console.log(`${colors.red}Failed to create test user: ${signUpError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}Created test user: ${tempEmail}${colors.reset}`);
      console.log(`${colors.green}Test user ID: ${signUpData.user.id}${colors.reset}`);
      console.log(`${colors.cyan}Token: ${signUpData.session.access_token}${colors.reset}`);
    }
    
    // Print service key for debugging
    console.log(`${colors.yellow}Service Key (first 10 chars): ${SUPABASE_SERVICE_KEY.substring(0, 10)}...${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the token generator
generateToken(); 
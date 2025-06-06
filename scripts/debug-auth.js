/**
 * Authentication Debugging Script
 * 
 * This script helps debug authentication issues with Supabase by:
 * 1. Testing the connection to Supabase
 * 2. Creating a test user if needed
 * 3. Generating a valid JWT token
 * 4. Testing the token against the Supabase API
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const axios = require('axios');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY; // Fallback to service key if anon key not defined
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'testpassword123';
const API_URL = 'http://localhost:3000/api';

// Color formatting for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Initialize Supabase client
console.log(`${colors.blue}Initializing Supabase clients...${colors.reset}`);

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create auth client with anon key - simulates frontend
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log(`${colors.blue}Supabase URL: ${SUPABASE_URL}${colors.reset}`);
console.log(`${colors.blue}Service Key (first 10 chars): ${SUPABASE_SERVICE_KEY.substring(0, 10)}...${colors.reset}`);
console.log(`${colors.blue}Anon Key (first 10 chars): ${SUPABASE_ANON_KEY.substring(0, 10)}...${colors.reset}`);

/**
 * Tests basic Supabase connectivity
 */
async function testConnection() {
  try {
    console.log(`\n${colors.magenta}Testing Supabase Connection...${colors.reset}`);
    
    // Test with service role key
    console.log(`${colors.blue}Testing with service role key...${colors.reset}`);
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (adminError) {
      console.log(`${colors.red}❌ Service role connection failed: ${adminError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Service role connection successful${colors.reset}`);
    }
    
    // Test with anon key 
    console.log(`${colors.blue}Testing with anon key...${colors.reset}`);
    const { data: authData, error: authError } = await supabaseAuth
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (authError && authError.code === 'PGRST301') {
      console.log(`${colors.yellow}⚠️ Anon key connection has limited permissions (expected)${colors.reset}`);
    } else if (authError) {
      console.log(`${colors.red}❌ Anon key connection failed: ${authError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Anon key connection successful${colors.reset}`);
    }
    
    return !adminError;
  } catch (error) {
    console.error(`${colors.red}❌ Connection test error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Attempts to sign in with existing user or creates a new one
 */
async function getOrCreateTestUser() {
  try {
    console.log(`\n${colors.magenta}Testing User Authentication...${colors.reset}`);
    
    // First try to sign in with test user
    console.log(`${colors.blue}Attempting to sign in with test user: ${TEST_EMAIL}${colors.reset}`);
    const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (!signInError && signInData?.user) {
      console.log(`${colors.green}✅ Successfully signed in with existing user${colors.reset}`);
      return {
        user: signInData.user,
        session: signInData.session
      };
    }
    
    console.log(`${colors.yellow}⚠️ Sign-in failed: ${signInError.message}${colors.reset}`);
    
    // If sign-in failed, try to create the user
    console.log(`${colors.blue}Creating new user or resetting password...${colors.reset}`);
    
    // Check if user already exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(TEST_EMAIL);
    
    if (!userError && userData?.user) {
      // User exists but couldn't sign in - send password reset
      console.log(`${colors.blue}User exists, sending password reset email...${colors.reset}`);
      
      const { error: resetError } = await supabaseAuth.auth.resetPasswordForEmail(TEST_EMAIL);
      
      if (resetError) {
        console.log(`${colors.red}❌ Password reset failed: ${resetError.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Password reset email sent to ${TEST_EMAIL}${colors.reset}`);
        console.log(`${colors.yellow}Please check your email and set a new password${colors.reset}`);
        console.log(`${colors.yellow}Then run this script again to sign in${colors.reset}`);
      }
      
      return { error: 'Password reset sent' };
    } else {
      // User doesn't exist - create a new one
      console.log(`${colors.blue}Creating new test user...${colors.reset}`);
      
      const { data: newUserData, error: newUserError } = await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Debug Test User'
        }
      });
      
      if (newUserError) {
        console.log(`${colors.red}❌ Failed to create test user: ${newUserError.message}${colors.reset}`);
        return { error: newUserError.message };
      }
      
      console.log(`${colors.green}✅ Successfully created test user${colors.reset}`);
      console.log(`${colors.blue}User ID: ${newUserData.user.id}${colors.reset}`);
      
      // Try to sign in with the new user
      const { data: newSignInData, error: newSignInError } = await supabaseAuth.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      if (newSignInError) {
        console.log(`${colors.red}❌ Failed to sign in with new user: ${newSignInError.message}${colors.reset}`);
        return { error: newSignInError.message };
      }
      
      console.log(`${colors.green}✅ Successfully signed in with new user${colors.reset}`);
      return {
        user: newSignInData.user,
        session: newSignInData.session
      };
    }
  } catch (error) {
    console.error(`${colors.red}❌ User authentication error: ${error.message}${colors.reset}`);
    return { error: error.message };
  }
}

/**
 * Tests API endpoints with the token
 */
async function testApiWithToken(token) {
  try {
    console.log(`\n${colors.magenta}Testing API Endpoints with Token...${colors.reset}`);
    
    // Save token to file for other scripts to use
    fs.writeFileSync('./scripts/token.txt', token);
    console.log(`${colors.green}✅ Saved token to scripts/token.txt${colors.reset}`);
    
    // Test health endpoint (unprotected)
    console.log(`\n${colors.blue}Testing health endpoint...${colors.reset}`);
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log(`${colors.green}✅ Health check successful${colors.reset}`);
      console.log(`${colors.blue}Response status: ${healthResponse.status}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Health check failed: ${error.message}${colors.reset}`);
    }
    
    // Test debug auth endpoint
    console.log(`\n${colors.blue}Testing debug-auth endpoint...${colors.reset}`);
    try {
      const debugAuthResponse = await axios.get(`${API_URL}/debug-auth`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(`${colors.green}✅ Debug auth successful${colors.reset}`);
      console.log(`${colors.blue}Response status: ${debugAuthResponse.status}${colors.reset}`);
      console.log(`${colors.blue}Response data:${colors.reset}`, JSON.stringify(debugAuthResponse.data, null, 2));
    } catch (error) {
      console.error(`${colors.red}❌ Debug auth failed: ${error.response?.status || 'unknown'}${colors.reset}`);
      if (error.response?.data) {
        console.error(`${colors.red}Error details: ${JSON.stringify(error.response.data)}${colors.reset}`);
      }
    }
    
    // Test protected endpoint (history)
    console.log(`\n${colors.blue}Testing protected endpoint (history)...${colors.reset}`);
    try {
      const historyResponse = await axios.get(`${API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(`${colors.green}✅ Protected endpoint access successful${colors.reset}`);
      console.log(`${colors.blue}Response status: ${historyResponse.status}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Protected endpoint access failed: ${error.response?.status || 'unknown'}${colors.reset}`);
      if (error.response?.data) {
        console.error(`${colors.red}Error details: ${JSON.stringify(error.response.data)}${colors.reset}`);
      }
    }
  } catch (error) {
    console.error(`${colors.red}❌ API test error: ${error.message}${colors.reset}`);
  }
}

/**
 * Displays detailed token information
 */
function inspectToken(token) {
  try {
    console.log(`\n${colors.magenta}Token Inspection:${colors.reset}`);
    
    // Parse JWT token (it's base64 encoded)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log(`${colors.red}❌ Invalid JWT format (should have 3 parts)${colors.reset}`);
      return;
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log(`${colors.blue}Header:${colors.reset}`, JSON.stringify(header, null, 2));
    console.log(`${colors.blue}Payload:${colors.reset}`, JSON.stringify(payload, null, 2));
    
    // Check expiration
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expirationDate < now;
      
      console.log(`${colors.blue}Expiration:${colors.reset} ${expirationDate.toLocaleString()}`);
      console.log(`${isExpired ? colors.red : colors.green}Token is ${isExpired ? 'EXPIRED' : 'VALID'}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Token inspection error: ${error.message}${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Step 1: Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.log(`${colors.red}❌ Connection test failed, cannot proceed${colors.reset}`);
      return;
    }
    
    // Step 2: Get or create test user
    const { user, session, error } = await getOrCreateTestUser();
    if (error) {
      console.log(`${colors.red}❌ User authentication failed: ${error}${colors.reset}`);
      return;
    }
    
    if (!session || !session.access_token) {
      console.log(`${colors.red}❌ No access token available${colors.reset}`);
      return;
    }
    
    console.log(`${colors.green}✅ Successfully obtained access token${colors.reset}`);
    
    // Step 3: Inspect token
    inspectToken(session.access_token);
    
    // Step 4: Test API with token
    await testApiWithToken(session.access_token);
    
    console.log(`\n${colors.green}🎉 Debug process completed${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Unexpected error: ${error.message}${colors.reset}`);
  }
}

// Run the main function
main(); 
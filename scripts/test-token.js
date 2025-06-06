/**
 * Simple Token Test Script
 * Tests Supabase token generation and verification
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY;
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'testpassword123';

// Create clients
console.log('Creating Supabase clients...');
console.log('URL:', SUPABASE_URL);
console.log('Service Key (first 10):', SUPABASE_SERVICE_KEY.substring(0, 10) + '...');

// Client for server-side operations (using service role key)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Client for frontend-like operations (using anon key)
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Generate a JWT token by signing in
 */
async function generateToken() {
  try {
    console.log('\nAttempting to sign in...');
    
    // Try to sign in with credentials
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('Sign-in failed:', error.message);
      return null;
    }
    
    console.log('Sign-in successful!');
    console.log('User ID:', data.user.id);
    
    // Save token to file
    const token = data.session.access_token;
    fs.writeFileSync('./scripts/token.txt', token);
    console.log('Token saved to scripts/token.txt');
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    return null;
  }
}

/**
 * Verify a JWT token directly
 */
async function verifyToken(token) {
  try {
    console.log('\nVerifying token...');
    
    // Approach 1: Using getUser
    console.log('\nApproach 1: Using getUser');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      console.error('Verification failed (getUser):', userError.message);
    } else if (userData.user) {
      console.log('✅ Token verification successful with getUser!');
      console.log('User ID:', userData.user.id);
      console.log('Email:', userData.user.email);
    }
    
    // Approach 2: Parsing and examining the token manually
    console.log('\nApproach 2: Manual token inspection');
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Token is not in valid JWT format');
    } else {
      try {
        const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        console.log('Token header:', header);
        console.log('Token payload:');
        console.log('- Subject:', payload.sub);
        console.log('- Issuer:', payload.iss);
        console.log('- Expiration:', new Date(payload.exp * 1000).toLocaleString());
        console.log('- Role:', payload.role);
        
        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          console.error('❌ Token is expired!');
        } else {
          console.log('✅ Token is not expired');
        }
      } catch (e) {
        console.error('Error parsing token:', e.message);
      }
    }
  } catch (error) {
    console.error('Error verifying token:', error.message);
  }
}

// Main function
async function main() {
  // Generate token (or reuse existing)
  let token;
  
  // Check if token file exists
  if (fs.existsSync('./scripts/token.txt')) {
    console.log('Found existing token file. Using it for verification...');
    token = fs.readFileSync('./scripts/token.txt', 'utf8').trim();
  } else {
    token = await generateToken();
    if (!token) {
      console.error('Failed to generate token. Exiting.');
      return;
    }
  }
  
  // Verify token
  await verifyToken(token);
}

// Run the script
main().catch(console.error); 
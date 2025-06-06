/**
 * Token Generator
 * Generates a valid JWT token for testing the API
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'testpassword123';

// Create client with anon key (simulates frontend)
console.log('Creating Supabase client...');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Sign in and generate token
 */
async function generateToken() {
  try {
    console.log('Attempting to sign in with email:', TEST_EMAIL);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.error('Sign-in failed:', error.message);
      return null;
    }
    
    console.log('Sign-in successful!');
    console.log('User ID:', data.user.id);
    
    // Extract and save token
    const token = data.session.access_token;
    fs.writeFileSync('./scripts/token.txt', token);
    
    console.log('Token saved to scripts/token.txt');
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    
    // Parse JWT to show info
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      console.log('\nToken information:');
      console.log('- User ID:', payload.sub);
      console.log('- Email:', payload.email);
      console.log('- Role:', payload.role);
      console.log('- Issued at:', new Date(payload.iat * 1000).toLocaleString());
      console.log('- Expires at:', new Date(payload.exp * 1000).toLocaleString());
    }
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    return null;
  }
}

// Run script
generateToken().catch(console.error); 
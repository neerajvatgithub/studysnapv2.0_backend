/**
 * Test Supabase Connection and Token Verification
 * This script verifies that our Supabase configuration can validate tokens
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load token from file
const token = fs.readFileSync('./scripts/token.txt', 'utf8').trim();

// Supabase config
console.log('Initializing Supabase with:');
console.log(`URL: ${process.env.SUPABASE_URL}`);
console.log(`Service Key (first 10 chars): ${process.env.SUPABASE_SERVICE_KEY.substring(0, 10)}...`);

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper function to display user data safely
function displayUser(user) {
  if (!user) return 'No user data';
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata
  };
}

async function testConnection() {
  try {
    console.log('\n1. Testing basic Supabase connection...');
    const { data: version, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.error('❌ Connection test failed:', versionError.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('   Version info:', version);
    }
    
    console.log('\n2. Testing token verification...');
    console.log('   Token (first 20 chars): ' + token.substring(0, 20) + '...');
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('❌ Token verification failed:', error.message);
      console.error('   Error details:', error);
    } else if (!data.user) {
      console.error('❌ Token verification failed: No user returned');
    } else {
      console.log('✅ Token verification successful!');
      console.log('   User:', displayUser(data.user));
    }
    
    // Additional debug: Test another approach to validate JWT
    console.log('\n3. Testing token via session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session retrieval failed:', sessionError.message);
    } else if (!sessionData.session) {
      console.log('ℹ️ No active session found');
    } else {
      console.log('✅ Session found!');
      console.log('   Session user:', displayUser(sessionData.session?.user));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testConnection(); 
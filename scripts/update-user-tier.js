/**
 * Update User Tier Script
 * This script updates the subscription tier of our test user
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Create a Supabase client with the service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test user credentials
const TEST_EMAIL = 'meetneerajv@gmail.com';
const TEST_PASSWORD = 'StudySnap123!';

async function updateUserTier() {
  console.log(`${colors.blue}Updating subscription tier for user: ${TEST_EMAIL}${colors.reset}`);
  
  try {
    // First sign in to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      throw new Error(`Failed to sign in: ${signInError.message}`);
    }
    
    if (!signInData || !signInData.user) {
      throw new Error('User not found after sign in');
    }
    
    const userId = signInData.user.id;
    console.log(`${colors.green}Found user ID: ${userId}${colors.reset}`);
    
    // Update user profile with subscription tier (plan type)
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        plan_type: 'free',
        tokens_remaining: 50, // Set to default free tier tokens
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }
    
    console.log(`${colors.green}Successfully updated user plan type to 'free'${colors.reset}`);
    
    // Get updated profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      throw new Error(`Failed to fetch updated profile: ${profileError.message}`);
    }
    
    // Display updated user information
    console.log(`\n${colors.magenta}Updated User Information:${colors.reset}`);
    console.log(`${colors.cyan}Tokens Remaining: ${profileData.tokens_remaining}${colors.reset}`);
    console.log(`${colors.cyan}Plan Type: ${profileData.plan_type}${colors.reset}`);
    console.log(`${colors.cyan}Profile Updated At: ${new Date(profileData.updated_at).toLocaleString()}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Run the script
updateUserTier(); 
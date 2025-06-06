/**
 * Check User Tokens Script
 * This script checks the token usage and subscription tier of our test user
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

// Test user email
const TEST_EMAIL = 'meetneerajv@gmail.com';

async function checkUserTokens() {
  console.log(`${colors.blue}Checking tokens for user: ${TEST_EMAIL}${colors.reset}`);
  
  try {
    // First sign in to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: 'StudySnap123!'
    });
    
    if (signInError) {
      throw new Error(`Failed to sign in: ${signInError.message}`);
    }
    
    if (!signInData || !signInData.user) {
      throw new Error('User not found after sign in');
    }
    
    const userId = signInData.user.id;
    console.log(`${colors.green}Found user ID: ${userId}${colors.reset}`);
    
    // Get user profile with token information
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }
    
    if (!profileData) {
      throw new Error('Profile not found');
    }
    
    // Display user token information
    console.log(`\n${colors.magenta}User Token Information:${colors.reset}`);
    console.log(`${colors.cyan}Tokens Remaining: ${profileData.tokens_remaining}${colors.reset}`);
    console.log(`${colors.cyan}Plan Type: ${profileData.plan_type}${colors.reset}`);
    
    if (profileData.subscription_ends_at) {
      console.log(`${colors.cyan}Subscription Ends At: ${new Date(profileData.subscription_ends_at).toLocaleString()}${colors.reset}`);
    }
    
    console.log(`${colors.cyan}Profile Created At: ${new Date(profileData.created_at).toLocaleString()}${colors.reset}`);
    console.log(`${colors.cyan}Profile Updated At: ${new Date(profileData.updated_at).toLocaleString()}${colors.reset}`);
    
    // Get token transaction history
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (transactionError) {
      console.error(`${colors.yellow}Warning: Failed to fetch transactions: ${transactionError.message}${colors.reset}`);
    } else {
      console.log(`\n${colors.magenta}Token Transaction History:${colors.reset}`);
      
      if (transactionData && transactionData.length > 0) {
        transactionData.forEach((transaction, index) => {
          console.log(`${colors.blue}Transaction ${index + 1}:${colors.reset}`);
          console.log(`  ${colors.cyan}Type: ${transaction.type}${colors.reset}`);
          console.log(`  ${colors.cyan}Tokens: ${transaction.tokens_amount}${colors.reset}`);
          console.log(`  ${colors.cyan}Date: ${new Date(transaction.created_at).toLocaleString()}${colors.reset}`);
        });
      } else {
        console.log(`${colors.yellow}No token transactions found${colors.reset}`);
      }
    }
    
    // Get video usage history
    const { data: videoData, error: videoError } = await supabase
      .from('video_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (videoError) {
      console.error(`${colors.yellow}Warning: Failed to fetch video usage: ${videoError.message}${colors.reset}`);
    } else {
      console.log(`\n${colors.magenta}Video Usage History:${colors.reset}`);
      
      if (videoData && videoData.length > 0) {
        videoData.forEach((video, index) => {
          console.log(`${colors.blue}Video ${index + 1}:${colors.reset}`);
          console.log(`  ${colors.cyan}Title: ${video.title}${colors.reset}`);
          console.log(`  ${colors.cyan}Video ID: ${video.video_id}${colors.reset}`);
          console.log(`  ${colors.cyan}Output Type: ${video.output_type}${colors.reset}`);
          console.log(`  ${colors.cyan}Date: ${new Date(video.created_at).toLocaleString()}${colors.reset}`);
        });
      } else {
        console.log(`${colors.yellow}No video usage found${colors.reset}`);
      }
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Run the script
checkUserTokens(); 
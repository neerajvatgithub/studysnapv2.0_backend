/**
 * Test script for token deduction with a specific YouTube video
 */
require('dotenv').config();
const supabase = require('../src/config/supabase');
const tokenService = require('../src/services/tokenService');
const { extractVideoId } = require('../src/middleware/validationMiddleware');

// User ID to test with
const USER_ID = process.argv[2];
if (!USER_ID) {
  console.log('Please provide a user ID');
  console.log('Usage: node test-specific-video.js <user_id>');
  process.exit(1);
}

// YouTube URL from the user
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=GKCBpj9FQXU';
const VIDEO_ID = extractVideoId(YOUTUBE_URL);

if (!VIDEO_ID) {
  console.error('Invalid YouTube URL');
  process.exit(1);
}

/**
 * Check user token balance
 */
async function getUserBalance(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('tokens_remaining, plan_type')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw new Error(`Failed to get user balance: ${error.message}`);
  }
  
  return {
    tokens: data.tokens_remaining,
    plan: data.plan_type
  };
}

/**
 * Get transactions
 */
async function getTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error getting transactions:', error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Get video usage
 */
async function getVideoUsage(userId, videoId) {
  const { data, error } = await supabase
    .from('video_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting video usage:', error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Test token deduction with specific video
 */
async function testWithSpecificVideo() {
  try {
    console.log('======== SPECIFIC VIDEO TEST ========');
    console.log(`Testing with user ID: ${USER_ID}`);
    console.log(`Testing with YouTube URL: ${YOUTUBE_URL}`);
    console.log(`Extracted video ID: ${VIDEO_ID}`);
    console.log('--------------------------------------------');
    
    // Check existing usage
    console.log('\nChecking if video was already processed...');
    const existingUsage = await getVideoUsage(USER_ID, VIDEO_ID);
    
    if (existingUsage.length > 0) {
      console.log(`Video has been processed ${existingUsage.length} times by this user:`);
      existingUsage.forEach((usage, i) => {
        console.log(`${i+1}. Type: ${usage.output_type}, Status: ${usage.status}, Date: ${new Date(usage.created_at).toLocaleString()}`);
      });
    } else {
      console.log('Video has not been processed by this user before');
    }
    
    // Get initial balance
    const initialBalance = await getUserBalance(USER_ID);
    console.log(`\nInitial token balance: ${initialBalance.tokens} (${initialBalance.plan} plan)`);
    
    // Check with tokenService
    const hasProcessed = await tokenService.hasUserProcessedVideo(USER_ID, VIDEO_ID);
    console.log(`\nTokenService says video already processed: ${hasProcessed}`);
    
    // Try to deduct tokens
    console.log('\nAttempting to deduct tokens...');
    if (!hasProcessed) {
      await tokenService.deductTokens(USER_ID, 10, VIDEO_ID);
      console.log('Tokens deducted for new video');
    } else {
      console.log('Skipping token deduction (already processed)');
    }
    
    // Record video usage
    console.log('\nRecording video usage...');
    const usageRecordId = await tokenService.recordVideoUsage(USER_ID, VIDEO_ID, 'transcript', 'completed');
    console.log(`Video usage record created: ${usageRecordId}`);
    
    // Get updated balance
    const finalBalance = await getUserBalance(USER_ID);
    console.log(`\nFinal token balance: ${finalBalance.tokens} (${finalBalance.plan} plan)`);
    
    // Check if deduction worked
    const tokensDeducted = initialBalance.tokens - finalBalance.tokens;
    console.log(`Tokens deducted: ${tokensDeducted}`);
    
    // Verify recent transactions
    console.log('\nRecent transactions:');
    const transactions = await getTransactions(USER_ID);
    if (transactions.length > 0) {
      transactions.forEach((tx, i) => {
        console.log(`${i+1}. Type: ${tx.type}, Amount: ${tx.tokens_amount}, Date: ${new Date(tx.created_at).toLocaleString()}`);
      });
    } else {
      console.log('No transactions found');
    }
    
    // Final checks
    console.log('\nFinal check of video usage records:');
    const finalUsage = await getVideoUsage(USER_ID, VIDEO_ID);
    console.log(`Total records for this video: ${finalUsage.length}`);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testWithSpecificVideo()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 
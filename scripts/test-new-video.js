/**
 * Test script with a new video ID to verify token deduction
 */
require('dotenv').config();
const supabase = require('../src/config/supabase');
const tokenService = require('../src/services/tokenService');

// User ID to test with
const USER_ID = process.argv[2];
if (!USER_ID) {
  console.log('Please provide a user ID');
  console.log('Usage: node test-new-video.js <user_id>');
  process.exit(1);
}

// Generate a unique video ID for testing
const TEST_VIDEO_ID = 'test_video_' + Date.now();

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
 * Reset user tokens
 */
async function resetUserTokens(userId, amount = 1000) {
  try {
    console.log(`\nResetting user tokens to ${amount}...`);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        tokens_remaining: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error resetting user tokens:', error.message);
    } else {
      console.log('User tokens reset successfully');
    }
    
  } catch (error) {
    console.error('Failed to reset user tokens:', error);
  }
}

/**
 * Test token deduction
 */
async function testTokenDeduction() {
  try {
    console.log('======== NEW VIDEO TEST ========');
    console.log(`Testing with user ID: ${USER_ID}`);
    console.log(`Testing with video ID: ${TEST_VIDEO_ID}`);
    console.log('--------------------------------------------');
    
    // Reset tokens for clean test
    await resetUserTokens(USER_ID, 1000);
    
    // Get initial balance
    const initialBalance = await getUserBalance(USER_ID);
    console.log(`\nInitial token balance: ${initialBalance.tokens} (${initialBalance.plan} plan)`);
    
    // Step 1: Check if video was processed
    console.log('\nChecking if video was processed before...');
    const hasProcessed = await tokenService.hasUserProcessedVideo(USER_ID, TEST_VIDEO_ID);
    console.log(`Video already processed: ${hasProcessed}`);
    
    // Step 2: Deduct tokens
    console.log('\nAttempting to deduct tokens...');
    await tokenService.deductTokens(USER_ID, 10, TEST_VIDEO_ID);
    
    // Step 3: Get updated balance
    const afterDeductionBalance = await getUserBalance(USER_ID);
    console.log(`\nBalance after token deduction: ${afterDeductionBalance.tokens} (${afterDeductionBalance.plan} plan)`);
    console.log(`Tokens deducted: ${initialBalance.tokens - afterDeductionBalance.tokens}`);
    
    // Step 4: Record usage
    console.log('\nRecording video usage...');
    const usageRecordId = await tokenService.recordVideoUsage(USER_ID, TEST_VIDEO_ID, 'transcript', 'completed');
    console.log(`Video usage record created: ${usageRecordId}`);
    
    // Step 5: Try to deduct tokens again (should be skipped)
    console.log('\nAttempting to deduct tokens again (should be skipped)...');
    await tokenService.deductTokens(USER_ID, 10, TEST_VIDEO_ID);
    
    // Step 6: Get final balance
    const finalBalance = await getUserBalance(USER_ID);
    console.log(`\nFinal token balance: ${finalBalance.tokens} (${finalBalance.plan} plan)`);
    console.log(`Additional tokens deducted: ${afterDeductionBalance.tokens - finalBalance.tokens}`);
    console.log(`Total tokens deducted: ${initialBalance.tokens - finalBalance.tokens}`);
    
    // Final check
    if (initialBalance.tokens - finalBalance.tokens === 10) {
      console.log('\n✅ TEST PASSED: Exactly 10 tokens were deducted as expected');
    } else {
      console.log(`\n❌ TEST FAILED: ${initialBalance.tokens - finalBalance.tokens} tokens were deducted (expected 10)`);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testTokenDeduction()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 
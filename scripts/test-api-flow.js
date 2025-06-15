/**
 * Test script to simulate the full API flow 
 * This script mocks the transcript controller to debug token deduction issues
 */
require('dotenv').config();
const tokenService = require('../src/services/tokenService');
const transcriptService = require('../src/services/transcriptService');
const supabase = require('../src/config/supabase');

// Get user ID from command line arguments
const USER_ID = process.argv[2];
if (!USER_ID) {
  console.log('Please provide a user ID');
  console.log('Usage: node test-api-flow.js <user_id>');
  process.exit(1);
}

// Generate unique test video ID
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
 * Mock the transcript controller flow
 */
async function mockTranscriptController() {
  console.log('===== MOCKING TRANSCRIPT CONTROLLER FLOW =====');
  
  try {
    // Step 1: Get initial token balance
    const initialBalance = await getUserBalance(USER_ID);
    console.log(`Initial token balance: ${initialBalance.tokens} (${initialBalance.plan} plan)`);
    
    // Step 2: Check if video was processed before
    console.log('\nChecking if video was already processed...');
    const hasProcessed = await tokenService.hasUserProcessedVideo(USER_ID, TEST_VIDEO_ID);
    console.log(`Video already processed: ${hasProcessed}`);
    
    // Step 3: Deduct tokens if this is first time processing
    if (!hasProcessed) {
      console.log('\nDeducting tokens (first time processing)...');
      await tokenService.deductTokens(USER_ID, 10, TEST_VIDEO_ID);
    } else {
      console.log('\nSkipping token deduction (already processed)...');
    }
    
    // Step 4: Record video usage
    console.log('\nRecording video usage...');
    const usageRecordId = await tokenService.recordVideoUsage(USER_ID, TEST_VIDEO_ID, 'transcript', 'pending');
    console.log(`Video usage record created: ${usageRecordId}`);
    
    // Step 5: Get updated balance
    const finalBalance = await getUserBalance(USER_ID);
    console.log(`\nFinal token balance: ${finalBalance.tokens} (${finalBalance.plan} plan)`);
    
    // Check if deduction worked
    const tokensDeducted = initialBalance.tokens - finalBalance.tokens;
    console.log(`Tokens deducted: ${tokensDeducted}`);
    
    if (!hasProcessed && tokensDeducted === 10) {
      console.log('✅ TEST PASSED: Tokens were deducted for new video');
    } else if (hasProcessed && tokensDeducted === 0) {
      console.log('✅ TEST PASSED: No tokens were deducted for already processed video');
    } else {
      console.log(`❌ TEST FAILED: Expected ${hasProcessed ? '0' : '10'} tokens to be deducted, but ${tokensDeducted} were deducted`);
    }
    
    // Step 6: Check transactions
    console.log('\nRecent transactions:');
    const transactions = await getTransactions(USER_ID);
    if (transactions.length > 0) {
      transactions.forEach((tx, i) => {
        console.log(`${i+1}. Type: ${tx.type}, Amount: ${tx.tokens_amount}, Date: ${new Date(tx.created_at).toLocaleString()}`);
      });
    } else {
      console.log('No transactions found');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

/**
 * Mock the notes controller flow
 */
async function mockNotesController() {
  console.log('\n===== MOCKING NOTES CONTROLLER FLOW =====');
  
  try {
    // Step 1: Get initial token balance
    const initialBalance = await getUserBalance(USER_ID);
    console.log(`Initial token balance: ${initialBalance.tokens} (${initialBalance.plan} plan)`);
    
    // Step 2: Check if video was processed before
    console.log('\nChecking if video was already processed...');
    const hasProcessed = await tokenService.hasUserProcessedVideo(USER_ID, TEST_VIDEO_ID);
    console.log(`Video already processed: ${hasProcessed}`);
    
    // Step 3: Deduct tokens if this is first time processing
    if (!hasProcessed) {
      console.log('\nDeducting tokens (first time processing)...');
      await tokenService.deductTokens(USER_ID, 10, TEST_VIDEO_ID);
    } else {
      console.log('\nSkipping token deduction (already processed)...');
    }
    
    // Step 4: Record video usage
    console.log('\nRecording video usage...');
    const usageRecordId = await tokenService.recordVideoUsage(USER_ID, TEST_VIDEO_ID, 'smart_notes', 'pending');
    console.log(`Video usage record created: ${usageRecordId}`);
    
    // Step 5: Get updated balance
    const finalBalance = await getUserBalance(USER_ID);
    console.log(`\nFinal token balance: ${finalBalance.tokens} (${finalBalance.plan} plan)`);
    
    // Check if deduction worked
    const tokensDeducted = initialBalance.tokens - finalBalance.tokens;
    console.log(`Tokens deducted: ${tokensDeducted}`);
    
    if (!hasProcessed && tokensDeducted === 10) {
      console.log('✅ TEST PASSED: Tokens were deducted for new video');
    } else if (hasProcessed && tokensDeducted === 0) {
      console.log('✅ TEST PASSED: No tokens were deducted for already processed video');
    } else {
      console.log(`❌ TEST FAILED: Expected ${hasProcessed ? '0' : '10'} tokens to be deducted, but ${tokensDeducted} were deducted`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
async function runTests() {
  try {
    console.log('======== API FLOW TEST ========');
    console.log(`Testing with user ID: ${USER_ID}`);
    console.log(`Testing with video ID: ${TEST_VIDEO_ID}`);
    console.log('--------------------------------------------');
    
    await mockTranscriptController();
    await mockNotesController();
    
    console.log('\n======== TEST COMPLETE ========');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 
/**
 * Script to verify token deduction behavior
 * 
 * Usage: node verify-token-deduction.js <user_id> [new|existing]
 */

// Load environment variables
require('dotenv').config();

const supabase = require('../src/config/supabase');
const tokenService = require('../src/services/tokenService');
const transcriptService = require('../src/services/transcriptService');

// Check command line args
const userId = process.argv[2];
const testType = process.argv[3] || 'existing';

if (!userId) {
  console.error('Please provide a user ID');
  console.error('Usage: node verify-token-deduction.js <user_id> [new|existing]');
  process.exit(1);
}

// Test video IDs
const EXISTING_VIDEO_ID = 'TYEqenKrbaM'; // Video likely already processed
const NEW_VIDEO_ID = 'RNIKMmK7lQ4'; // Different video that may not have been processed

// Choose video based on test type
const TEST_VIDEO_ID = testType === 'new' ? NEW_VIDEO_ID : EXISTING_VIDEO_ID;

// Helper function to get current token balance
async function getUserTokens(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('tokens_remaining, plan_type')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user tokens:', error);
    return null;
  }
  
  return {
    tokens: data.tokens_remaining,
    plan: data.plan_type
  };
}

// Main test function
async function runTest() {
  console.log(`======== TOKEN DEDUCTION VERIFICATION TEST ========`);
  console.log(`Testing with user ID: ${userId}`);
  console.log(`Testing with video ID: ${TEST_VIDEO_ID} (${testType} video)`);
  console.log('--------------------------------------------');
  
  try {
    // Get initial token balance
    const initialBalance = await getUserTokens(userId);
    console.log(`Initial token balance: ${initialBalance.tokens} (${initialBalance.plan} plan)`);
    
    // Check if video was already processed
    console.log('\nChecking if video was already processed...');
    const wasProcessedBefore = await tokenService.hasUserProcessedVideo(userId, TEST_VIDEO_ID);
    console.log(`Video was already processed: ${wasProcessedBefore}`);
    
    // Simulate transcript controller behavior
    console.log('\nSimulating transcript controller behavior:');
    
    // First deduct tokens if not already processed (only for the transcript endpoint)
    let tokensDeducted = false;
    if (!wasProcessedBefore) {
      await tokenService.deductTokens(userId, 10, TEST_VIDEO_ID);
      tokensDeducted = true;
      console.log('Tokens deducted for transcript endpoint');
    } else {
      console.log('SKIPPED token deduction (video already processed)');
    }
    
    // Then record video usage
    const transcriptUsageId = await tokenService.recordVideoUsage(userId, TEST_VIDEO_ID, 'transcript', 'pending');
    console.log(`Recorded video usage: ${transcriptUsageId}`);
    
    // Get transcript with skipTokenDeduction=true
    await transcriptService.getTranscript(TEST_VIDEO_ID, 'test-session', userId, true);
    console.log('Retrieved transcript with skipTokenDeduction=true');
    
    // Update usage record
    await tokenService.updateVideoUsageStatus(transcriptUsageId, 'completed');
    console.log('Updated video usage status to completed');
    
    // Simulate notes controller behavior
    console.log('\nSimulating notes controller behavior:');
    
    // Check if video was already processed (now it should be)
    const wasProcessedForNotes = await tokenService.hasUserProcessedVideo(userId, TEST_VIDEO_ID);
    console.log(`Video was already processed: ${wasProcessedForNotes}`);
    
    // Simulate notes controller behavior
    if (!wasProcessedForNotes) {
      await tokenService.deductTokens(userId, 10, TEST_VIDEO_ID);
      tokensDeducted = true;
      console.log('Tokens deducted for notes endpoint');
    } else {
      console.log('SKIPPED token deduction (video already processed)');
    }
    
    // Record notes usage
    const notesUsageId = await tokenService.recordVideoUsage(userId, TEST_VIDEO_ID, 'smart_notes', 'pending');
    console.log(`Recorded video usage: ${notesUsageId}`);
    
    // Get transcript with skipTokenDeduction=true
    await transcriptService.getTranscript(TEST_VIDEO_ID, 'test-session', userId, true);
    console.log('Retrieved transcript with skipTokenDeduction=true');
    
    // Update usage record
    await tokenService.updateVideoUsageStatus(notesUsageId, 'completed');
    console.log('Updated video usage status to completed');
    
    // Get final token balance
    const finalBalance = await getUserTokens(userId);
    console.log('\n--------------------------------------------');
    console.log(`Final token balance: ${finalBalance.tokens} (${finalBalance.plan} plan)`);
    console.log(`Tokens used: ${initialBalance.tokens - finalBalance.tokens}`);
    
    // Check if the expected token deduction happened
    if (tokensDeducted) {
      if (initialBalance.tokens - finalBalance.tokens === 10) {
        console.log('✅ TEST PASSED: Exactly 10 tokens were deducted for a new video');
      } else {
        console.log(`❌ TEST FAILED: ${initialBalance.tokens - finalBalance.tokens} tokens were deducted (expected 10)`);
      }
    } else {
      if (initialBalance.tokens === finalBalance.tokens) {
        console.log('✅ TEST PASSED: No tokens were deducted for previously processed video');
      } else {
        console.log(`❌ TEST FAILED: ${initialBalance.tokens - finalBalance.tokens} tokens were deducted for a previously processed video (expected 0)`);
      }
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
runTest(); 
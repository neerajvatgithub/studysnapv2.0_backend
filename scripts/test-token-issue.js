/**
 * Test script for token deduction issues
 * This script directly calls the token service to check if deduction works
 */
require('dotenv').config();
const supabase = require('../src/config/supabase');
const tokenService = require('../src/services/tokenService');

// User ID to test with
const USER_ID = process.argv[2];
if (!USER_ID) {
  console.log('Please provide a user ID');
  console.log('Usage: node test-token-issue.js <user_id>');
  process.exit(1);
}

// Test video ID
const TEST_VIDEO_ID = 'test_video_' + Date.now();

// Main test function
async function testTokenDeduction() {
  try {
    console.log('======== TOKEN DEDUCTION TEST ========');
    console.log(`Testing with user ID: ${USER_ID}`);
    console.log(`Testing with video ID: ${TEST_VIDEO_ID}`);
    console.log('--------------------------------------------');
    
    // Get initial token balance
    const { data: initialData, error: initialError } = await supabase
      .from('profiles')
      .select('tokens_remaining, plan_type')
      .eq('id', USER_ID)
      .single();
    
    if (initialError) {
      console.error('Error fetching initial token balance:', initialError.message);
      return;
    }
    
    console.log(`Initial token balance: ${initialData.tokens_remaining} (${initialData.plan_type} plan)`);
    
    // Try to deduct tokens
    console.log('\nAttempting to deduct 10 tokens...');
    await tokenService.deductTokens(USER_ID, 10, TEST_VIDEO_ID);
    
    // Get updated token balance
    const { data: updatedData, error: updatedError } = await supabase
      .from('profiles')
      .select('tokens_remaining, plan_type')
      .eq('id', USER_ID)
      .single();
    
    if (updatedError) {
      console.error('Error fetching updated token balance:', updatedError.message);
      return;
    }
    
    console.log(`Updated token balance: ${updatedData.tokens_remaining} (${updatedData.plan_type} plan)`);
    
    // Check if deduction worked
    const deductedAmount = initialData.tokens_remaining - updatedData.tokens_remaining;
    console.log(`Tokens deducted: ${deductedAmount}`);
    
    if (deductedAmount === 10) {
      console.log('✅ TEST PASSED: Tokens were successfully deducted');
    } else {
      console.log(`❌ TEST FAILED: Expected 10 tokens to be deducted, but ${deductedAmount} were deducted`);
    }
    
    // Check for transaction record
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (txError) {
      console.error('Error fetching transaction records:', txError.message);
    } else if (transactions && transactions.length > 0) {
      console.log('\nLatest transaction:');
      console.log(`- ID: ${transactions[0].id}`);
      console.log(`- Type: ${transactions[0].type}`);
      console.log(`- Amount: ${transactions[0].tokens_amount}`);
      console.log(`- Created: ${new Date(transactions[0].created_at).toLocaleString()}`);
    } else {
      console.log('❌ No transaction records found');
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
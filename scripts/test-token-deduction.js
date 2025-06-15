/**
 * Token Deduction Test Script
 * 
 * This script will simulate API calls to trace token deduction
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test URLs
const VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Test video
const USER_ID = process.argv[2] || 'f692a406-011d-4080-9911-58651658a526'; // Default test user ID

// Function to check token balance
async function checkTokenBalance(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens_remaining, plan_type')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Failed to get token balance:', error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error checking token balance:', err.message);
    return null;
  }
}

// Function to get transaction history
async function getTransactions(userId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Failed to get transactions:', error.message);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Error getting transactions:', err.message);
    return [];
  }
}

// Function to record token usage
async function recordTokenUsage(userId, tokens, type) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        tokens_amount: tokens,
        type: type,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Failed to record transaction:', error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error recording transaction:', err.message);
    return false;
  }
}

// Function to deduct tokens
async function deductTokens(userId, amount) {
  try {
    // First get current balance
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('tokens_remaining')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Failed to fetch token balance:', fetchError.message);
      return false;
    }
    
    const newBalance = userData.tokens_remaining - amount;
    
    // Update balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tokens_remaining: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Failed to update token balance:', updateError.message);
      return false;
    }
    
    // Record transaction
    await recordTokenUsage(userId, amount, 'consumption');
    
    return true;
  } catch (err) {
    console.error('Error deducting tokens:', err.message);
    return false;
  }
}

// Function to simulate each API endpoint
async function simulateEndpointCall(endpoint, userId) {
  try {
    console.log(`\n----- Testing ${endpoint.toUpperCase()} endpoint -----`);
    
    // Get initial balance
    const initialBalance = await checkTokenBalance(userId);
    if (!initialBalance) return 0;
    
    console.log(`Initial token balance: ${initialBalance.tokens_remaining} (${initialBalance.plan_type} plan)`);
    
    // Only transcript endpoint deducts tokens directly
    if (endpoint === 'transcript') {
      console.log(`Simulating ${endpoint} endpoint call (deducts tokens directly)...`);
      await deductTokens(userId, 10);
    } else {
      console.log(`Simulating ${endpoint} endpoint call (doesn't deduct tokens directly)...`);
    }
    
    // Get final balance
    const finalBalance = await checkTokenBalance(userId);
    if (!finalBalance) return 0;
    
    console.log(`Final token balance: ${finalBalance.tokens_remaining} (${finalBalance.plan_type} plan)`);
    
    // Calculate tokens deducted
    const tokensDeducted = initialBalance.tokens_remaining - finalBalance.tokens_remaining;
    console.log(`Tokens deducted: ${tokensDeducted}`);
    
    // Show recent transactions
    console.log(`\nRecent transactions:`);
    const transactions = await getTransactions(userId);
    transactions.forEach((tx, i) => {
      console.log(`  ${i+1}. Type: ${tx.type}, Amount: ${tx.tokens_amount}, Date: ${new Date(tx.created_at).toLocaleString()}`);
    });
    
    return tokensDeducted;
  } catch (err) {
    console.error(`Error simulating ${endpoint} endpoint:`, err.message);
    return 0;
  }
}

// Main function to run tests
async function runTests() {
  try {
    console.log(`Running token deduction tests for user ID: ${USER_ID}`);
    
    // Get initial token balance
    const initialBalance = await checkTokenBalance(USER_ID);
    if (initialBalance) {
      console.log(`\nStarting token balance: ${initialBalance.tokens_remaining} (${initialBalance.plan_type} plan)`);
    }
    
    // Test each endpoint
    const endpoints = ['transcript', 'notes', 'mindmap', 'flashcards'];
    let totalDeducted = 0;
    
    for (const endpoint of endpoints) {
      const deducted = await simulateEndpointCall(endpoint, USER_ID);
      totalDeducted += deducted;
    }
    
    // Get final token balance
    const finalBalance = await checkTokenBalance(USER_ID);
    if (finalBalance) {
      console.log(`\nFinal token balance: ${finalBalance.tokens_remaining} (${finalBalance.plan_type} plan)`);
    }
    
    console.log(`\n----- Test Summary -----`);
    console.log(`Total tokens deducted: ${totalDeducted}`);
    
    if (initialBalance && finalBalance) {
      const actualDifference = initialBalance.tokens_remaining - finalBalance.tokens_remaining;
      console.log(`Actual token difference: ${actualDifference}`);
      
      if (actualDifference !== totalDeducted) {
        console.log(`⚠️ WARNING: Actual difference (${actualDifference}) doesn't match expected (${totalDeducted})`);
      }
    }
    
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

// Run the tests
runTests(); 
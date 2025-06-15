/**
 * Script to test all endpoints with the same video
 * to verify token deduction behavior
 * 
 * Usage: node test-all-endpoints.js <user_id>
 */

// Load environment variables
require('dotenv').config();

const axios = require('axios');
const supabase = require('../src/config/supabase');

// Check command line args
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID');
  console.error('Usage: node test-all-endpoints.js <user_id>');
  process.exit(1);
}

// Test video ID to use
const TEST_VIDEO_ID = 'TYEqenKrbaM';
const TEST_URL = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;

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
  // Configure axios for API requests
  const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  console.log(`======== ENDPOINT TOKEN DEDUCTION TEST ========`);
  console.log(`Testing with user ID: ${userId}`);
  console.log(`Testing with video ID: ${TEST_VIDEO_ID}`);
  console.log(`Testing with URL: ${TEST_URL}`);
  console.log('--------------------------------------------');
  
  try {
    // Get initial token balance
    const initialBalance = await getUserTokens(userId);
    if (!initialBalance) {
      console.error('Failed to get initial token balance');
      process.exit(1);
    }
    
    console.log(`Initial token balance: ${initialBalance.tokens} (${initialBalance.plan} plan)`);
    
    // Test all endpoints in sequence
    const endpoints = [
      { name: 'TRANSCRIPT', endpoint: '/transcript' },
      { name: 'NOTES', endpoint: '/notes' },
      { name: 'MINDMAP', endpoint: '/mindmap' },
      { name: 'FLASHCARDS', endpoint: '/flashcards' }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n${endpoint.name} ENDPOINT TEST:`);
      
      try {
        // Get token balance before calling endpoint
        const beforeBalance = await getUserTokens(userId);
        console.log(`Token balance before ${endpoint.name}: ${beforeBalance.tokens}`);
        
        // Call the endpoint
        console.log(`Calling ${endpoint.endpoint} endpoint...`);
        const response = await apiClient.post(endpoint.endpoint, {
          url: TEST_URL,
          sessionId: 'test-session'
        });
        
        console.log(`${endpoint.name} endpoint response status: ${response.status}`);
        
        // Get token balance after calling endpoint
        const afterBalance = await getUserTokens(userId);
        console.log(`Token balance after ${endpoint.name}: ${afterBalance.tokens}`);
        
        // Calculate token difference
        const tokensDifference = beforeBalance.tokens - afterBalance.tokens;
        if (tokensDifference === 0) {
          console.log(`✅ SUCCESS: No tokens deducted for ${endpoint.name} endpoint (expected)`);
        } else {
          console.log(`❌ ERROR: ${tokensDifference} tokens deducted for ${endpoint.name} endpoint (expected 0)`);
        }
      } catch (error) {
        console.error(`Error testing ${endpoint.name} endpoint:`, error.message);
        if (error.response) {
          console.error('Response error data:', error.response.data);
        }
      }
      
      // Add a small delay between endpoint calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Get final token balance
    const finalBalance = await getUserTokens(userId);
    console.log('\n--------------------------------------------');
    console.log(`Final token balance: ${finalBalance.tokens} (${finalBalance.plan} plan)`);
    console.log(`Total tokens used: ${initialBalance.tokens - finalBalance.tokens}`);
    
    // Check if the expected token deduction happened
    if (initialBalance.tokens - finalBalance.tokens === 10) {
      console.log('✅ TEST PASSED: Only 10 tokens were deducted for the whole test');
    } else if (initialBalance.tokens - finalBalance.tokens === 0) {
      console.log('✅ TEST PASSED: No tokens were deducted (video was already processed)');
    } else {
      console.log(`❌ TEST FAILED: ${initialBalance.tokens - finalBalance.tokens} tokens were deducted (expected 0 or 10)`);
    }
    
    // Show video usage records
    console.log('\nVideo usage records:');
    const { data: usageData, error: usageError } = await supabase
      .from('video_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', TEST_VIDEO_ID)
      .order('created_at', { ascending: false });
      
    if (usageError) {
      console.error('Error fetching video usage:', usageError);
    } else {
      console.log(`Found ${usageData.length} video usage records for this video`);
      
      usageData.forEach((record, index) => {
        console.log(`${index + 1}. Output: ${record.output_type}, Status: ${record.status}, Created: ${record.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
runTest(); 
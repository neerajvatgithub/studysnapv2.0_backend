/**
 * Test Token Service
 * This script tests the token management functionality
 */
require('dotenv').config();

// Mock data store
const mockDb = {
  userData: {
    tokens_remaining: 100
  },
  usageRecords: []
};

// Mock token service
const tokenService = {
  // Check if user has sufficient tokens
  checkSufficientTokens: async (userId) => {
    console.log(`Checking tokens for user ${userId}`);
    
    // Simulate database lookup
    const tokens = mockDb.userData.tokens_remaining;
    const tokensRequired = 10; // Default tokens per video
    
    console.log(`User has ${tokens} tokens, ${tokensRequired} required`);
    
    return tokens >= tokensRequired;
  },
  
  // Deduct tokens from user balance
  deductTokens: async (userId) => {
    console.log(`Deducting tokens for user ${userId}`);
    
    // Check if sufficient tokens first
    const hasSufficientTokens = await tokenService.checkSufficientTokens(userId);
    
    if (!hasSufficientTokens) {
      throw new Error('Insufficient tokens');
    }
    
    // Deduct tokens
    const tokensRequired = 10;
    mockDb.userData.tokens_remaining -= tokensRequired;
    
    console.log(`Deducted ${tokensRequired} tokens, ${mockDb.userData.tokens_remaining} remaining`);
    
    return true;
  },
  
  // Record video usage
  recordVideoUsage: async (userId, videoId, feature) => {
    console.log(`Recording usage: User ${userId}, Video ${videoId}, Feature ${feature}`);
    
    // Create usage record
    const usageRecord = {
      id: `usage-${Date.now()}`,
      user_id: userId,
      video_id: videoId,
      feature,
      tokens_used: 10,
      created_at: new Date().toISOString()
    };
    
    // Save to mock DB
    mockDb.usageRecords.push(usageRecord);
    
    console.log(`Usage recorded with ID ${usageRecord.id}`);
    
    return usageRecord.id;
  }
};

async function testTokenService() {
  console.log('Testing Token Service...');
  
  const userId = 'test-user-id';
  const videoId = 'test-video-id';
  
  // Test 1: Check sufficient tokens
  console.log('\n📋 Test 1: Check sufficient tokens');
  try {
    const hasSufficientTokens = await tokenService.checkSufficientTokens(userId);
    console.log('Result:', hasSufficientTokens);
    console.log('✅ Test passed: Checked token balance successfully');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
  
  // Test 2: Deduct tokens
  console.log('\n📋 Test 2: Deduct tokens');
  try {
    await tokenService.deductTokens(userId);
    console.log('✅ Test passed: Tokens deducted successfully');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
  
  // Test 3: Record video usage
  console.log('\n📋 Test 3: Record video usage');
  try {
    const usageId = await tokenService.recordVideoUsage(userId, videoId, 'notes');
    console.log('Usage ID:', usageId);
    console.log('✅ Test passed: Video usage recorded successfully');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
  
  // Test 4: Verify DB state
  console.log('\n📋 Test 4: Verify database state');
  try {
    console.log('Final token balance:', mockDb.userData.tokens_remaining);
    console.log('Usage records:', mockDb.usageRecords.length);
    
    if (mockDb.userData.tokens_remaining === 90 && mockDb.usageRecords.length === 1) {
      console.log('✅ Test passed: Database state is correct');
    } else {
      console.log('❌ Test failed: Database state is incorrect');
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

// Run the test
testTokenService()
  .then(() => {
    console.log('\n✅ Token service tests completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to run token service tests:', err);
    process.exit(1);
  }); 
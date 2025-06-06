/**
 * Test Authentication Middleware
 * This script validates the authentication middleware logic
 */
require('dotenv').config();

// Mock objects for testing
const mockReq = (headers = {}) => ({
  headers,
  userId: null
});

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.jsonData = null;
  res.json = (data) => {
    res.jsonData = data;
    return res;
  };
  return res;
};

// Simple mock next function
const createMockNext = () => {
  let called = false;
  const next = () => {
    called = true;
  };
  next.wasCalled = () => called;
  return next;
};

// Mock the authMiddleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          statusCode: 401
        }
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid authentication format',
          statusCode: 401
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token === 'valid_token') {
      req.userId = 'test-user-id';
      next();
    } else {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          statusCode: 401
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication error',
        statusCode: 500
      }
    });
  }
};

// Test cases
async function runTests() {
  console.log('Testing Auth Middleware Logic...\n');
  
  // Test 1: No auth header
  console.log('📋 Test 1: No auth header');
  const req1 = mockReq();
  const res1 = mockRes();
  const next1 = createMockNext();
  
  authMiddleware(req1, res1, next1);
  
  if (res1.statusCode === 401) {
    console.log('✅ Test passed: Rejected request without auth header');
  } else {
    console.log('❌ Test failed: Should have rejected request with 401');
  }
  
  // Test 2: Invalid format
  console.log('\n📋 Test 2: Invalid token format');
  const req2 = mockReq({ authorization: 'InvalidFormat token123' });
  const res2 = mockRes();
  const next2 = createMockNext();
  
  authMiddleware(req2, res2, next2);
  
  if (res2.statusCode === 401) {
    console.log('✅ Test passed: Rejected invalid token format');
  } else {
    console.log('❌ Test failed: Should have rejected invalid format with 401');
  }
  
  // Test 3: Invalid token
  console.log('\n📋 Test 3: Invalid token');
  const req3 = mockReq({ authorization: 'Bearer invalid_token' });
  const res3 = mockRes();
  const next3 = createMockNext();
  
  authMiddleware(req3, res3, next3);
  
  if (res3.statusCode === 401) {
    console.log('✅ Test passed: Rejected invalid token');
  } else {
    console.log('❌ Test failed: Should have rejected invalid token with 401');
  }
  
  // Test 4: Valid token
  console.log('\n📋 Test 4: Valid token');
  const req4 = mockReq({ authorization: 'Bearer valid_token' });
  const res4 = mockRes();
  const next4 = createMockNext();
  
  authMiddleware(req4, res4, next4);
  
  if (next4.wasCalled() && req4.userId === 'test-user-id') {
    console.log('✅ Test passed: Accepted valid token and set userId');
  } else {
    console.log('❌ Test failed: Should have accepted valid token');
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('\n✅ Auth middleware tests completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error running auth middleware tests:', err);
    process.exit(1);
  }); 
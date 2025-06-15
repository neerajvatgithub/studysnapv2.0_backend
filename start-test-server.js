/**
 * Start server with auth bypass using custom user ID
 * 
 * Usage:
 * node start-test-server.js YOUR_USER_ID
 * 
 * If no user ID is provided, it will use the default test user
 */
require('dotenv').config();

// Get user ID from command line arguments
const userIdArg = process.argv[2];
if (userIdArg) {
  process.env.TEST_USER_ID = userIdArg;
  console.log(`🔧 Using custom test user ID: ${userIdArg}`);
}

// Set environment variables before requiring the server
process.env.BYPASS_AUTH = 'true';
process.env.NODE_ENV = 'development';

// Start the server
require('./server.js');

console.log('🚀 Server started with AUTH BYPASS ENABLED');
if (userIdArg) {
  console.log(`👤 Using custom user ID: ${userIdArg}`);
} else {
  console.log('👤 Using default test user ID');
}
console.log('🔑 No authentication headers required for API requests'); 
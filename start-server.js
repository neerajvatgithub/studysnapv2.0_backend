/**
 * Start server with proper authentication (no bypass)
 */
require('dotenv').config();

// Set environment variables before requiring the server
process.env.BYPASS_AUTH = 'false';
process.env.NODE_ENV = 'development';

// Start the server
require('./server.js');

console.log('🚀 Server started with AUTHENTICATION ENABLED');
console.log('🔐 You must provide proper authentication headers'); 
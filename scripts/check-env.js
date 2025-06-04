/**
 * Script to check if environment variables are loaded correctly
 */
require('dotenv').config();

console.log('Checking environment variables...');
console.log('PORT =', process.env.PORT || 'Not set');
console.log('NODE_ENV =', process.env.NODE_ENV || 'Not set');
console.log('RAPIDAPI_KEY =', process.env.RAPIDAPI_KEY ? 'Set (hidden)' : 'Not set');
console.log('GEMINI_API_KEY =', process.env.GEMINI_API_KEY ? 'Set (hidden)' : 'Not set');

// Check if we're having an issue with dotenv
console.log('\nDebug info:');
console.log('Current directory:', process.cwd());
console.log('Is .env file loading correctly?', require('fs').existsSync('.env') ? 'Yes (.env exists)' : 'No (.env not found)'); 
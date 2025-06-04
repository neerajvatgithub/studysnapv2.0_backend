/**
 * Script to test RapidAPI YouTube Transcript API directly
 */
require('dotenv').config();
const axios = require('axios');

// Get the API key from .env
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
if (!RAPIDAPI_KEY) {
  console.error('Error: RAPIDAPI_KEY is not set in .env file');
  process.exit(1);
}

// Video ID to test with
const videoId = 'dQw4w9WgXcQ'; // Rick Astley's "Never Gonna Give You Up"
const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

console.log(`Testing RapidAPI YouTube Transcript API with video: ${youtubeUrl}`);
console.log(`Using API Key: ****${RAPIDAPI_KEY.substr(-4)}`);
console.log('API Host: youtube-transcript3.p.rapidapi.com');
console.log('API Endpoint: /api/transcript-with-url');

// Make the API request
axios.get('https://youtube-transcript3.p.rapidapi.com/api/transcript-with-url', {
  params: { 
    url: youtubeUrl,
    flat_text: true,
    lang: 'en'
  },
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'youtube-transcript3.p.rapidapi.com'
  }
})
.then(response => {
  console.log('\nSuccess! Received transcript data:');
  
  if (response.data && response.data.transcript) {
    console.log(`Title: ${response.data.title || 'Not available'}`);
    console.log(`Duration: ${response.data.duration || 'Not available'}`);
    console.log(`Transcript length: ${response.data.transcript.length} characters`);
    console.log(`First 200 characters: ${response.data.transcript.substring(0, 200)}...`);
    
    // Write instructions for next steps
    console.log('\nNext steps:');
    console.log('1. Your API key is working correctly with the YouTube Transcript API');
    console.log('2. Start the server with: npm run dev');
    console.log('3. Test the full application with: node scripts/testApi.js');
  } else {
    console.log('Response format is different than expected:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
  }
})
.catch(error => {
  console.error('\nError from RapidAPI:');
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`Status: ${error.response.status}`);
    console.error('Data:', error.response.data);
    
    // Provide helpful instructions based on error
    if (error.response.status === 403) {
      console.error('\nIt appears you are not subscribed to this API. Please:');
      console.error('1. Go to RapidAPI: https://rapidapi.com/');
      console.error('2. Search for "YouTube Transcript"');
      console.error('3. Subscribe to the API with host: youtube-transcript3.p.rapidapi.com');
      console.error('4. Make sure you\'re using the same API key in your .env file');
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    console.error('\nCheck your internet connection and try again.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message);
  }
}); 
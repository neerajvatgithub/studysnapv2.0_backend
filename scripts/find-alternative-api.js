/**
 * Script to find alternative YouTube transcript APIs on RapidAPI
 * 
 * This script tests several known YouTube transcript APIs available on RapidAPI
 * to help you find one that works with your current API key.
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

// List of alternative APIs to try
const apis = [
  {
    name: "YouTube Transcript API",
    host: "youtube-transcript-api.p.rapidapi.com",
    endpoint: "/retrieve",
    params: { videoId }
  },
  {
    name: "YouTube v31",
    host: "youtube-v31.p.rapidapi.com",
    endpoint: "/captions",
    params: { id: videoId }
  },
  {
    name: "YouTube v3",
    host: "youtube-v3-alternative.p.rapidapi.com",
    endpoint: "/captions",
    params: { id: videoId }
  },
  {
    name: "YouTube Data API by API-Ninjas",
    host: "youtube-data8.p.rapidapi.com",
    endpoint: "/video",
    params: { id: videoId }
  }
];

console.log(`Testing your RapidAPI key (****${RAPIDAPI_KEY.substr(-4)}) with ${apis.length} different YouTube APIs...\n`);

// Test each API
const testApi = async (api) => {
  console.log(`Testing API: ${api.name}`);
  console.log(`Host: ${api.host}`);
  console.log(`Endpoint: ${api.endpoint}`);
  
  try {
    const response = await axios.get(`https://${api.host}${api.endpoint}`, {
      params: api.params,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': api.host
      },
      timeout: 5000 // 5 second timeout
    });
    
    console.log('✅ SUCCESS! This API works with your key.');
    console.log(`Status: ${response.status}`);
    console.log('Response data:', typeof response.data === 'object' ? 'Object received' : 'Data received');
    
    // If this is a transcript API we're looking for
    if (response.data && (Array.isArray(response.data) || response.data.captions)) {
      console.log('\n🎯 PERFECT MATCH! This API can provide transcripts.');
      console.log('Use this API in your project:');
      console.log(`1. Update the host in transcriptService.js to: '${api.host}'`);
      console.log(`2. Update the endpoint to: '${api.endpoint}'`);
      console.log(`3. Update the params format if needed\n`);
    }
    
    return { success: true, api };
  } catch (error) {
    console.log('❌ Error:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Message:', error.response.data.message || JSON.stringify(error.response.data));
    } else if (error.request) {
      console.log('No response received');
    } else {
      console.log(error.message);
    }
    
    return { success: false, api };
  } finally {
    console.log('-----------------------------------\n');
  }
};

// Run all tests
const runTests = async () => {
  const results = [];
  
  for (const api of apis) {
    const result = await testApi(api);
    results.push(result);
  }
  
  // Show summary
  console.log('=== SUMMARY ===');
  const workingApis = results.filter(r => r.success);
  
  if (workingApis.length > 0) {
    console.log(`✅ ${workingApis.length} API(s) work with your key:`);
    workingApis.forEach(r => console.log(`- ${r.api.name} (${r.api.host})`));
    
    console.log('\nNext steps:');
    console.log('1. Choose one of the working APIs');
    console.log('2. Update transcriptService.js with the correct host and endpoint');
    console.log('3. Run your application again');
  } else {
    console.log('❌ None of the tested APIs work with your key.');
    console.log('\nNext steps:');
    console.log('1. Go to RapidAPI and subscribe to one of the YouTube transcript APIs');
    console.log('2. Update your .env file with the new API key');
    console.log('3. Try this script again');
  }
};

// Run all the tests
runTests(); 
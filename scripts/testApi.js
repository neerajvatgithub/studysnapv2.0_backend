/**
 * Test script for StudySnap API
 * 
 * Usage:
 * node scripts/testApi.js <youtube_url>
 */
const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Fallback to Rick Astley

// Get video URL from command line or use default
const videoUrl = process.argv[2] || DEFAULT_VIDEO_URL;

console.log(`Testing API with video URL: ${videoUrl}`);

/**
 * Make an API request
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @returns {Promise<Object>} - API response
 */
async function makeRequest(endpoint, data) {
  try {
    console.log(`\nCalling ${endpoint}...`);
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Run the test
 */
async function runTest() {
  try {
    // Step 1: Get transcript
    console.log('\n=== STEP 1: Get Transcript ===');
    const transcriptResponse = await makeRequest('transcript', { url: videoUrl });
    console.log('Transcript received:');
    console.log(`Title: ${transcriptResponse.data.title}`);
    console.log(`Duration: ${transcriptResponse.data.duration} seconds`);
    console.log(`Transcript length: ${transcriptResponse.data.transcript.length} characters`);
    console.log(`First 200 characters: ${transcriptResponse.data.transcript.substring(0, 200)}...`);
    
    const transcript = transcriptResponse.data.transcript;
    const videoId = transcriptResponse.data.videoId;
    
    // Step 2: Generate Notes (using the transcript)
    console.log('\n=== STEP 2: Generate Notes ===');
    const notesResponse = await makeRequest('notes', { 
      url: videoUrl, 
      transcript 
    });
    console.log('Notes received:');
    console.log(`First 500 characters: ${notesResponse.data.notes.substring(0, 500)}...`);
    
    // Step 3: Generate Mindmap
    console.log('\n=== STEP 3: Generate Mindmap ===');
    const mindmapResponse = await makeRequest('mindmap', { 
      url: videoUrl, 
      transcript 
    });
    console.log('Mindmap received:');
    console.log(`Root: ${mindmapResponse.data.mindmap.root}`);
    console.log(`Main topics: ${mindmapResponse.data.mindmap.children.length}`);
    
    // Step 4: Generate Flashcards
    console.log('\n=== STEP 4: Generate Flashcards ===');
    const flashcardsResponse = await makeRequest('flashcards', { 
      url: videoUrl, 
      transcript 
    });
    console.log('Flashcards received:');
    console.log(`Number of flashcards: ${flashcardsResponse.data.flashcards.length}`);
    
    // Summary
    console.log('\n=== TEST COMPLETE ===');
    console.log('All API endpoints working correctly!');
    
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Error running test:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest(); 
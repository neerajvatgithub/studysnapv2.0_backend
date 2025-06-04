/**
 * Service for fetching and processing YouTube transcripts
 */
const axios = require('axios');
const { ApiError } = require('../utils/errorHandler');
const storageService = require('./storageService');
const youtubeService = require('./youtubeService');
const { sanitizeText } = require('../utils/sanitizer');

// RapidAPI YouTube Transcript API configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'youtube-transcript3.p.rapidapi.com';
const RAPIDAPI_URL = 'https://youtube-transcript3.p.rapidapi.com/api/transcript-with-url';

/**
 * Fetch transcript from RapidAPI YouTube Transcript API
 * 
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Transcript data
 * @throws {ApiError} - If transcript fetch fails
 */
const fetchTranscript = async (videoId) => {
  try {
    // Construct the full YouTube URL
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await axios.get(RAPIDAPI_URL, {
      params: { 
        url: youtubeUrl,
        flat_text: true,
        lang: 'en'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Process the transcript data
    if (response.data && response.data.transcript) {
      // Use the flat_text parameter to get a single string
      const fullTranscript = response.data.transcript;
      
      // Try to get video title from the response or use a placeholder
      const title = response.data.title || `YouTube Video (${videoId})`;
      
      return {
        transcript: sanitizeText(fullTranscript),
        title: sanitizeText(title),
        duration: response.data.duration || 0
      };
    }
    
    throw new ApiError(500, 'Invalid transcript data format');
  } catch (error) {
    console.error('Transcript fetch error:', error.message);
    
    // Handle specific error cases
    if (error.response) {
      const statusCode = error.response.status;
      
      if (statusCode === 404) {
        throw new ApiError(404, 'Transcript not found for this video');
      } else if (statusCode === 403) {
        throw new ApiError(403, 'API key authentication failed');
      }
    }
    
    // Generic error
    throw new ApiError(500, 'Failed to fetch transcript');
  }
};

/**
 * Get transcript for a video, using cache if available
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} sessionId - Optional session identifier
 * @returns {Promise<Object>} - Transcript data
 */
const getTranscript = async (videoId, sessionId = '') => {
  // Generate storage key
  const storageKey = youtubeService.getStorageKey(videoId, sessionId);
  
  // Check cache first
  const cachedData = storageService.get(storageKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Fetch transcript if not in cache
  const transcriptData = await fetchTranscript(videoId);
  
  // Store in cache
  storageService.set(storageKey, transcriptData);
  
  // Return transcript data
  return transcriptData;
};

module.exports = {
  getTranscript,
  fetchTranscript
}; 
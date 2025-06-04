/**
 * YouTube service for processing YouTube URLs and metadata
 */
const { extractVideoId } = require('../utils/sanitizer');

/**
 * Extracts and validates YouTube video ID from URL
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} - Valid video ID or null
 */
const getVideoId = (url) => {
  return extractVideoId(url);
};

/**
 * Generates a storage key for a video
 * Uses videoId and optional sessionId
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} sessionId - Optional session identifier
 * @returns {string} - Storage key
 */
const getStorageKey = (videoId, sessionId = '') => {
  if (sessionId) {
    return `${videoId}_${sessionId}`;
  }
  return videoId;
};

module.exports = {
  getVideoId,
  getStorageKey
}; 
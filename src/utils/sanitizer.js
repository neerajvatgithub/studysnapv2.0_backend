/**
 * YouTube URL parsing utilities
 */

/**
 * Extracts the video ID from a YouTube URL
 * Supports standard youtube.com and youtu.be formats
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
const extractVideoId = (url) => {
  if (!url) return null;
  
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Handle youtu.be format
    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.substring(1);
    }
    
    // Handle youtube.com format
    if (parsedUrl.hostname === 'youtube.com' || parsedUrl.hostname === 'www.youtube.com') {
      const videoIdParam = parsedUrl.searchParams.get('v');
      if (videoIdParam) {
        return videoIdParam;
      }
    }
    
    return null;
  } catch (error) {
    // URL parsing failed
    return null;
  }
};

/**
 * Sanitizes input text to prevent potential injection attacks
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
const sanitizeText = (text) => {
  if (!text) return '';
  
  // Basic sanitization: remove HTML tags, control characters, etc.
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\x20-\x7E\s]/g, '') // Remove non-printable ASCII
    .trim();
};

module.exports = {
  extractVideoId,
  sanitizeText
}; 
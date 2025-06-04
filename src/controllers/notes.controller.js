/**
 * Notes Controller
 */
const transcriptService = require('../services/transcriptService');
const llmService = require('../services/llm');
const { asyncHandler } = require('../utils/errorHandler');
const { formatSuccess } = require('../utils/responseFormatter');

/**
 * Generate smart notes from transcript
 * POST /api/notes
 */
const generateNotes = asyncHandler(async (req, res) => {
  const { url, transcript: providedTranscript, sessionId } = req.body;
  const videoId = req.videoId; // Added by validation middleware
  
  // Get transcript data (from input or by fetching)
  let transcript;
  let title;
  
  if (providedTranscript) {
    // Use provided transcript
    transcript = providedTranscript;
    
    // Try to get title if available
    try {
      const data = await transcriptService.getTranscript(videoId, sessionId);
      title = data.title;
    } catch (error) {
      // If we can't fetch the title, use a generic one
      title = `YouTube Video (${videoId})`;
    }
  } else {
    // Fetch transcript
    const transcriptData = await transcriptService.getTranscript(videoId, sessionId);
    transcript = transcriptData.transcript;
    title = transcriptData.title;
  }
  
  // Generate notes from transcript
  const notes = await llmService.generateNotes(transcript);
  
  // Format response
  const response = {
    videoId,
    title,
    notes
  };
  
  res.status(200).json(formatSuccess(response));
});

module.exports = {
  generateNotes
}; 
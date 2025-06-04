/**
 * Flashcards Controller
 */
const transcriptService = require('../services/transcriptService');
const llmService = require('../services/llm');
const { asyncHandler } = require('../utils/errorHandler');
const { formatSuccess } = require('../utils/responseFormatter');
const { ApiError } = require('../utils/errorHandler');

/**
 * Generate flashcards from transcript
 * POST /api/flashcards
 */
const generateFlashcards = asyncHandler(async (req, res) => {
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
  
  // Generate flashcards from transcript
  const flashcards = await llmService.generateFlashcards(transcript);
  
  // Validate flashcards structure
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    throw new ApiError(500, 'Invalid flashcards structure generated');
  }
  
  // Format response
  const response = {
    videoId,
    title,
    flashcards
  };
  
  res.status(200).json(formatSuccess(response));
});

module.exports = {
  generateFlashcards
}; 
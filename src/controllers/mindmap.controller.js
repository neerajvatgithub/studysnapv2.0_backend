/**
 * Mindmap Controller
 */
const transcriptService = require('../services/transcriptService');
const llmService = require('../services/llm');
const { asyncHandler } = require('../utils/errorHandler');
const { formatSuccess } = require('../utils/responseFormatter');
const { ApiError } = require('../utils/errorHandler');

/**
 * Generate mindmap from transcript
 * POST /api/mindmap
 */
const generateMindmap = asyncHandler(async (req, res) => {
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
  
  // Generate mindmap from transcript
  const mindmap = await llmService.generateMindmap(transcript);
  
  // Validate mindmap structure
  if (!mindmap || !mindmap.root || !Array.isArray(mindmap.children)) {
    throw new ApiError(500, 'Invalid mindmap structure generated');
  }
  
  // Format response
  const response = {
    videoId,
    title,
    mindmap
  };
  
  res.status(200).json(formatSuccess(response));
});

module.exports = {
  generateMindmap
}; 
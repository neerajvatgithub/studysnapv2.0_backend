/**
 * Transcript Controller
 */
const transcriptService = require('../services/transcriptService');
const { asyncHandler } = require('../utils/errorHandler');
const { formatSuccess } = require('../utils/responseFormatter');

/**
 * Get transcript for a YouTube video
 * POST /api/transcript
 */
const getTranscript = asyncHandler(async (req, res) => {
  const { url, sessionId } = req.body;
  const videoId = req.videoId; // Added by validation middleware
  
  // Get transcript data
  const transcriptData = await transcriptService.getTranscript(videoId, sessionId);
  
  // Format response
  const response = {
    videoId,
    transcript: transcriptData.transcript,
    title: transcriptData.title,
    duration: transcriptData.duration
  };
  
  res.status(200).json(formatSuccess(response));
});

module.exports = {
  getTranscript
}; 
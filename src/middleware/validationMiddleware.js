const Joi = require('joi');
const { extractVideoId } = require('../utils/sanitizer');

/**
 * Validates YouTube URL in request body
 */
const validateUrl = (req, res, next) => {
  const schema = Joi.object({
    url: Joi.string().required(),
    transcript: Joi.string().optional(),
    sessionId: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: error.details[0].message
      }
    });
  }

  // Check if URL is a valid YouTube URL
  const videoId = extractVideoId(req.body.url);
  if (!videoId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: 'Invalid YouTube URL'
      }
    });
  }
  
  // Add videoId to request for downstream handlers
  req.videoId = videoId;
  
  next();
};

module.exports = {
  validateUrl
}; 
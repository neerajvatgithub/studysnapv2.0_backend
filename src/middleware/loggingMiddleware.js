/**
 * Request Logging Middleware
 * 
 * Logs all API requests with detailed information
 */

// Track video processing to detect duplicates
const processedVideos = new Map();

/**
 * Logs API requests with details
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Get the path without query params
  const path = req.originalUrl.split('?')[0];
  
  // Log request details
  console.log(`🔹 [${requestId}] Request: ${req.method} ${path}`);
  
  // Track video ID for token deduction tracking
  const videoId = req.videoId || (req.body && req.body.videoId) || (req.query && req.query.videoId);
  const userId = req.userId;
  
  if (videoId && userId) {
    const userVideoKey = `${userId}-${videoId}`;
    
    // Check if this video was already processed by this user
    if (processedVideos.has(userVideoKey)) {
      const existing = processedVideos.get(userVideoKey);
      console.log(`⚠️ [${requestId}] DUPLICATE PROCESSING: User ${userId.substring(0, 8)} has already processed video ${videoId} (${existing.count} times):`);
      existing.endpoints.forEach(e => console.log(`   - ${e.endpoint} at ${new Date(e.timestamp).toLocaleTimeString()}`));
      
      // Update with this new endpoint
      existing.count++;
      existing.endpoints.push({
        endpoint: path,
        timestamp: Date.now(),
        requestId
      });
    } else {
      // First time processing this video
      processedVideos.set(userVideoKey, {
        count: 1,
        endpoints: [{
          endpoint: path,
          timestamp: Date.now(),
          requestId
        }]
      });
    }
  }
  
  // Capture response timing
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`🔹 [${requestId}] Response: ${res.statusCode} (${duration}ms)`);
    
    // Prune old entries from the map (older than 1 hour)
    const now = Date.now();
    for (const [key, value] of processedVideos.entries()) {
      const oldestEndpoint = value.endpoints[0];
      if (now - oldestEndpoint.timestamp > 60 * 60 * 1000) {
        processedVideos.delete(key);
      }
    }
  });
  
  next();
};

module.exports = {
  requestLogger
}; 
/**
 * History Controller
 * Handles endpoints related to user history and processing logs
 */
const supabase = require('../config/supabase');
const { asyncHandler } = require('../utils/errorHandler');
const { formatSuccess } = require('../utils/responseFormatter');

/**
 * Get user's video processing history
 * GET /api/history
 */
const getUserHistory = asyncHandler(async (req, res) => {
  const userId = req.userId; // Added by auth middleware
  const { limit = 20, offset = 0, status } = req.query;
  
  // Build query
  let query = supabase
    .from('video_usage')
    .select('*, transactions!inner(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
  
  // Filter by status if provided
  if (status) {
    query = query.eq('status', status);
  }
  
  // Execute query
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch history: ${error.message}`);
  }
  
  // Format response
  const response = {
    items: data,
    total: count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
  
  res.status(200).json(formatSuccess(response));
});

/**
 * Get user's processing statistics
 * GET /api/history/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.userId; // Added by auth middleware
  
  // Get counts by status and output type
  const { data: statusCounts, error: statusError } = await supabase
    .from('video_usage')
    .select('status, count(*)', { count: 'exact' })
    .eq('user_id', userId)
    .group('status');
  
  if (statusError) {
    throw new Error(`Failed to fetch status statistics: ${statusError.message}`);
  }
  
  const { data: typeCounts, error: typeError } = await supabase
    .from('video_usage')
    .select('output_type, count(*)', { count: 'exact' })
    .eq('user_id', userId)
    .group('output_type');
  
  if (typeError) {
    throw new Error(`Failed to fetch type statistics: ${typeError.message}`);
  }
  
  // Format response
  const response = {
    byStatus: statusCounts.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {}),
    byType: typeCounts.reduce((acc, item) => {
      acc[item.output_type] = parseInt(item.count);
      return acc;
    }, {})
  };
  
  res.status(200).json(formatSuccess(response));
});

module.exports = {
  getUserHistory,
  getUserStats
}; 
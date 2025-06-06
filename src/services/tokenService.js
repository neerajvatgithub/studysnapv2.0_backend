/**
 * Token management service for handling user tokens
 */
const supabase = require('../config/supabase');
const { ApiError } = require('../utils/errorHandler');

// Tokens required per video processing
const TOKENS_PER_VIDEO = parseInt(process.env.TOKENS_PER_VIDEO || '10');

/**
 * Check if user has sufficient tokens
 * 
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if user has sufficient tokens
 * @throws {ApiError} - If tokens check fails
 */
const checkSufficientTokens = async (userId) => {
  try {
    // Get user's token balance from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens_remaining')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw new ApiError(500, 'Failed to check token balance');
    }
    
    return data.tokens_remaining >= TOKENS_PER_VIDEO;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || 'Token check failed');
  }
};

/**
 * Deduct tokens from user's balance
 * 
 * @param {string} userId - User ID
 * @param {number} tokensToDeduct - Number of tokens to deduct (default: TOKENS_PER_VIDEO)
 * @returns {Promise<number>} - Remaining tokens
 * @throws {ApiError} - If token deduction fails
 */
const deductTokens = async (userId, tokensToDeduct = TOKENS_PER_VIDEO) => {
  try {
    // Check if user has sufficient tokens
    const hasSufficientTokens = await checkSufficientTokens(userId);
    
    if (!hasSufficientTokens) {
      throw new ApiError(402, 'Insufficient tokens');
    }
    
    // Update user's token balance
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        tokens_remaining: supabase.raw(`tokens_remaining - ${tokensToDeduct}`),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('tokens_remaining')
      .single();
    
    if (error) {
      throw new ApiError(500, 'Failed to deduct tokens');
    }
    
    // Record transaction
    await recordTransaction(userId, tokensToDeduct, 'consumption');
    
    return data.tokens_remaining;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || 'Token deduction failed');
  }
};

/**
 * Record token transaction
 * 
 * @param {string} userId - User ID
 * @param {number} tokens - Number of tokens
 * @param {string} type - Transaction type
 * @returns {Promise<void>}
 */
const recordTransaction = async (userId, tokens, type) => {
  try {
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        tokens_amount: tokens,
        type: type,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to record transaction:', error);
    // Non-blocking error - don't throw
  }
};

/**
 * Record video usage
 * 
 * @param {string} userId - User ID
 * @param {string} videoId - YouTube video ID
 * @param {string} title - Video title
 * @param {string} outputType - Output type (notes, mindmap, flashcards)
 * @returns {Promise<string>} - Record ID for future updates
 */
const recordVideoUsage = async (userId, videoId, title, outputType) => {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const { data, error } = await supabase
      .from('video_usage')
      .insert({
        user_id: userId,
        video_id: videoId,
        video_url: videoUrl,
        title: title,
        output_type: outputType,
        status: 'processing',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Failed to record video usage:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Failed to record video usage:', error);
    return null;
  }
};

/**
 * Update video processing status
 * 
 * @param {string} recordId - Video usage record ID
 * @param {string} status - Processing status (success, failed)
 * @param {string} errorMessage - Error message if failed (optional)
 * @returns {Promise<boolean>} - Success status
 */
const updateVideoStatus = async (recordId, status, errorMessage = null) => {
  if (!recordId) return false;
  
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }
    
    const { error } = await supabase
      .from('video_usage')
      .update(updateData)
      .eq('id', recordId);
    
    if (error) {
      console.error('Failed to update video status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update video status:', error);
    return false;
  }
};

module.exports = {
  checkSufficientTokens,
  deductTokens,
  recordTransaction,
  recordVideoUsage,
  updateVideoStatus
}; 
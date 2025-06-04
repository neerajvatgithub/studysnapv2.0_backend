/**
 * Admin Controller
 * Handles administrative functions like LLM provider management
 */
const llmService = require('../services/llm');
const { ApiError } = require('../utils/errorHandler');

/**
 * Get current LLM provider info
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCurrentLLMProvider = async (req, res, next) => {
  try {
    const providerInfo = llmService.getCurrentLLMProvider();
    
    res.json({
      success: true,
      data: providerInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change LLM provider
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const changeLLMProvider = async (req, res, next) => {
  try {
    const { provider } = req.body;
    
    if (!provider) {
      throw new ApiError(400, 'Provider name is required');
    }
    
    const success = llmService.changeLLMProvider(provider);
    
    if (!success) {
      throw new ApiError(400, `Invalid provider: ${provider}`);
    }
    
    // Get updated provider info
    const providerInfo = llmService.getCurrentLLMProvider();
    
    res.json({
      success: true,
      message: `LLM provider changed to: ${provider}`,
      data: providerInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available LLM providers with their status
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllLLMProviders = async (req, res, next) => {
  try {
    const providers = await llmService.getAllLLMProviders();
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test a specific LLM provider
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const testLLMProvider = async (req, res, next) => {
  try {
    const { provider } = req.body;
    
    if (!provider) {
      throw new ApiError(400, 'Provider name is required');
    }
    
    const testResult = await llmService.testLLMProvider(provider);
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentLLMProvider,
  changeLLMProvider,
  getAllLLMProviders,
  testLLMProvider
}; 
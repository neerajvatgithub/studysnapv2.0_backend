/**
 * LLM Service Factory
 * Creates and manages LLM provider instances
 */
const config = require('../../config');
const { ApiError } = require('../../utils/errorHandler');

// Import provider implementations
const GeminiService = require('./geminiService');
const GroqService = require('./groqService');

// Provider cache to avoid creating multiple instances
const providerInstances = {};

/**
 * Get LLM provider instance
 * @param {string} providerName - Provider name (optional, uses configured default if not specified)
 * @returns {Object} - LLM provider instance
 */
const getLLMProvider = (providerName = null) => {
  // Get provider name from argument or config
  const provider = providerName || config.llm.getCurrentProvider();
  
  // Return cached instance if available
  if (providerInstances[provider]) {
    return providerInstances[provider];
  }
  
  // Create new instance based on provider name
  let instance;
  
  switch (provider) {
    case 'gemini':
      instance = new GeminiService();
      break;
    case 'groq':
      instance = new GroqService();
      break;
    default:
      throw new ApiError(400, `Unsupported LLM provider: ${provider}`);
  }
  
  // Cache instance for future use
  providerInstances[provider] = instance;
  
  return instance;
};

/**
 * Change LLM provider
 * @param {string} providerName - Provider name
 * @returns {boolean} - Success
 */
const changeLLMProvider = (providerName) => {
  return config.llm.setProvider(providerName);
};

/**
 * Get current LLM provider info
 * @returns {Object} - Provider info
 */
const getCurrentLLMProvider = () => {
  const providerName = config.llm.getCurrentProvider();
  const provider = getLLMProvider(providerName);
  return provider.getInfo();
};

/**
 * Test LLM provider
 * @param {string} providerName - Provider name
 * @returns {Promise<Object>} - Test result
 */
const testLLMProvider = async (providerName) => {
  try {
    const provider = getLLMProvider(providerName);
    const result = await provider.test();
    return {
      provider: providerName,
      success: result,
      error: null
    };
  } catch (error) {
    return {
      provider: providerName,
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all available providers and their status
 * @returns {Promise<Array>} - Array of provider info objects with test results
 */
const getAllLLMProviders = async () => {
  const providers = config.llm.getAllProviders();
  
  // Test each provider
  const results = await Promise.all(
    providers.map(async provider => {
      const testResult = await testLLMProvider(provider.name);
      return {
        ...provider,
        working: testResult.success
      };
    })
  );
  
  return results;
};

/**
 * High-level function to handle transcript-to-notes generation
 * @param {string} transcript - Transcript text
 * @returns {Promise<string>} - Generated notes
 */
const generateNotes = async (transcript) => {
  const provider = getLLMProvider();
  return await provider.generateNotes(transcript);
};

/**
 * High-level function to handle transcript-to-mindmap generation
 * @param {string} transcript - Transcript text
 * @returns {Promise<Object>} - Generated mindmap
 */
const generateMindmap = async (transcript) => {
  const provider = getLLMProvider();
  return await provider.generateMindmap(transcript);
};

/**
 * High-level function to handle transcript-to-flashcards generation
 * @param {string} transcript - Transcript text
 * @returns {Promise<Array>} - Generated flashcards
 */
const generateFlashcards = async (transcript) => {
  const provider = getLLMProvider();
  return await provider.generateFlashcards(transcript);
};

module.exports = {
  getLLMProvider,
  changeLLMProvider,
  getCurrentLLMProvider,
  testLLMProvider,
  getAllLLMProviders,
  generateNotes,
  generateMindmap,
  generateFlashcards
}; 
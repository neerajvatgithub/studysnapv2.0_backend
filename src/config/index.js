/**
 * Main configuration export
 */
const llmConfig = require('./llm');

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // LLM configuration
  llm: {
    // Legacy properties for backward compatibility
    provider: llmConfig.getLlmProvider(),
    config: llmConfig.getProviderConfig(),
    
    // New provider management functions
    getLlmProvider: llmConfig.getLlmProvider,
    getProviderConfig: llmConfig.getProviderConfig,
    setProvider: llmConfig.setProvider,
    getCurrentProvider: llmConfig.getCurrentProvider,
    getAllProviders: llmConfig.getAllProviders,
    AVAILABLE_PROVIDERS: llmConfig.AVAILABLE_PROVIDERS
  },
  
  // Storage configuration
  storage: {
    transcriptTtl: parseInt(process.env.TRANSCRIPT_TTL_MINUTES || '30', 10)
  }
}; 
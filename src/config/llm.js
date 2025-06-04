/**
 * LLM Provider Configuration
 */

// Default provider is Gemini
const DEFAULT_PROVIDER = 'gemini';

// Available providers
const AVAILABLE_PROVIDERS = ['gemini', 'groq'];

// Get provider from environment variable or use default
const getLlmProvider = () => {
  const provider = process.env.LLM_PROVIDER || DEFAULT_PROVIDER;
  
  // Validate provider
  if (!AVAILABLE_PROVIDERS.includes(provider)) {
    console.warn(`Invalid LLM provider: ${provider}. Using default: ${DEFAULT_PROVIDER}`);
    return DEFAULT_PROVIDER;
  }
  
  return provider;
};

// Load current provider from environment or cached config
let currentProvider = getLlmProvider();

// Gemini configuration
const geminiConfig = {
  name: 'gemini',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-flash', // Using gemini-1.5-flash which is available
  maxTokens: 8192,
  temperature: 0.2
};

// Groq configuration
const groqConfig = {
  name: 'groq',
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile', // Default model
  maxTokens: 4096,
  temperature: 0.7,
  apiUrl: 'https://api.groq.com/openai/v1/chat/completions'
};

// Get configuration for specified provider
const getProviderConfig = (provider = currentProvider) => {
  switch (provider) {
    case 'gemini':
      return geminiConfig;
    case 'groq':
      return groqConfig;
    default:
      return geminiConfig;
  }
};

// Set current provider (used for runtime switching)
const setProvider = (provider) => {
  if (!AVAILABLE_PROVIDERS.includes(provider)) {
    console.warn(`Invalid LLM provider: ${provider}. Not changing from current: ${currentProvider}`);
    return false;
  }
  
  currentProvider = provider;
  console.log(`LLM provider changed to: ${provider}`);
  return true;
};

// Get current provider
const getCurrentProvider = () => {
  return currentProvider;
};

// Get all available providers and their status
const getAllProviders = () => {
  return AVAILABLE_PROVIDERS.map(provider => ({
    name: provider,
    current: provider === currentProvider,
    config: getProviderConfig(provider)
  }));
};

module.exports = {
  getLlmProvider,
  getProviderConfig,
  setProvider,
  getCurrentProvider,
  getAllProviders,
  AVAILABLE_PROVIDERS
}; 
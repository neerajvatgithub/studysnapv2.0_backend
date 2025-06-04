/**
 * Script to check available Gemini models for your API key
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get the API key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

// Initialize the API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log(`Testing Gemini API with key: ****${GEMINI_API_KEY.substr(-4)}`);

// Function to test a model
async function testModel(modelName) {
  try {
    console.log(`\nTesting model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = "Hello, can you tell me what model you are?";
    console.log(`Sending prompt: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log(`Response received: "${response.text().substring(0, 100)}..."`);
    
    return {
      model: modelName,
      status: 'SUCCESS',
      message: 'Model is available'
    };
  } catch (error) {
    return {
      model: modelName,
      status: 'ERROR',
      message: error.message
    };
  }
}

// List of models to test
const modelsToTest = [
  'gemini-pro',
  'gemini-1.0-pro', 
  'gemini-1.5-pro',
  'gemini-1.5-flash'
];

// Test all models and show results
async function testAllModels() {
  console.log('Testing available Gemini models...\n');
  
  const results = [];
  
  for (const model of modelsToTest) {
    const result = await testModel(model);
    results.push(result);
  }
  
  // Display results in a table
  console.log('\n=== RESULTS ===');
  console.table(results);
  
  // Show available models
  const availableModels = results.filter(r => r.status === 'SUCCESS').map(r => r.model);
  
  if (availableModels.length > 0) {
    console.log(`\nAvailable models: ${availableModels.join(', ')}`);
    console.log('\nTo use an available model:');
    console.log('1. Open src/config/llm.js');
    console.log(`2. Change model: 'gemini-pro' to model: '${availableModels[0]}'`);
    console.log('3. Do the same in src/services/llm/geminiService.js');
  } else {
    console.log('\nNo models are available for your API key.');
    console.log('Please check:');
    console.log('1. Your API key is correct');
    console.log('2. Your Google account has access to Gemini API');
    console.log('3. You have quota available');
  }
}

// Run the tests
testAllModels().catch(error => {
  console.error('Error testing models:', error);
}); 
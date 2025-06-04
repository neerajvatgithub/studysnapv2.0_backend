/**
 * Test script for Groq LLM integration
 * 
 * This script tests the Groq LLM provider with a simple prompt
 * to verify that your API key and integration are working correctly.
 * 
 * Usage: 
 * 1. Make sure you have set the GROQ_API_KEY in your .env file
 * 2. Run: node scripts/test-groq.js
 */
require('dotenv').config();
const axios = require('axios');

// Check if Groq API key is set
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('\x1b[31mError: GROQ_API_KEY is not set in your .env file\x1b[0m');
  console.log('Please add your Groq API key to .env file:');
  console.log('GROQ_API_KEY=your-api-key-here');
  process.exit(1);
}

console.log('\x1b[33mTesting Groq API connection...\x1b[0m');

// Groq API config
const config = {
  model: 'llama-3.3-70b-versatile', // Default model
  apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROQ_API_KEY}`
  },
  maxTokens: 100,
  temperature: 0.7
};

// Simple test message
const messages = [
  { role: 'user', content: 'What is the capital of France? Please answer in one word.' }
];

// Request data
const requestData = {
  model: config.model,
  messages: messages,
  temperature: config.temperature,
  max_tokens: config.maxTokens
};

// Make request to Groq API
async function testGroq() {
  try {
    console.log(`Using model: ${config.model}`);
    
    const startTime = Date.now();
    const response = await axios.post(
      config.apiUrl,
      requestData,
      { headers: config.headers }
    );
    const endTime = Date.now();
    
    if (response.data && 
        response.data.choices && 
        response.data.choices.length > 0 && 
        response.data.choices[0].message) {
      
      const answer = response.data.choices[0].message.content;
      const responseTime = (endTime - startTime) / 1000;
      
      console.log('\x1b[32m✓ Groq API connection successful!\x1b[0m');
      console.log(`Response received in: ${responseTime}s`);
      console.log('Response: ', answer);
      
      // Log some additional response data
      if (response.data.usage) {
        console.log('\nUsage stats:');
        console.log(`- Prompt tokens: ${response.data.usage.prompt_tokens}`);
        console.log(`- Completion tokens: ${response.data.usage.completion_tokens}`);
        console.log(`- Total tokens: ${response.data.usage.total_tokens}`);
      }
      
      console.log('\n\x1b[32mYour Groq integration is working properly!\x1b[0m');
      return true;
    } else {
      console.error('\x1b[31m✗ Error: Unexpected response format from Groq API\x1b[0m');
      console.error(response.data);
      return false;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Error connecting to Groq API:\x1b[0m');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Error data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\nTips for 401 Unauthorized error:');
        console.log('- Make sure your API key is correct');
        console.log('- Check that your account has access to the Groq API');
        console.log('- Verify that your API key has not expired');
      }
      
      if (error.response.status === 429) {
        console.log('\nTips for 429 Rate Limit error:');
        console.log('- You may have exceeded your API quota');
        console.log('- Check your Groq account for usage limits');
        console.log('- Try again later or upgrade your plan');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Groq API.');
      console.error('This could be a network issue or the API endpoint is down.');
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Run test
testGroq()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 
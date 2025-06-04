/**
 * Test script for all LLM integrations
 * 
 * This script tests all configured LLM providers
 * to verify that your API keys and integrations are working correctly.
 * 
 * Usage: 
 * 1. Make sure you have set the API keys in your .env file
 * 2. Run: node scripts/test-all-llm.js
 */
require('dotenv').config();
const llmService = require('../src/services/llm');
const config = require('../src/config');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Get the list of all providers to test
 */
async function getProvidersToTest() {
  try {
    // Fallback to hardcoded providers if not accessible from config
    return config.llm.AVAILABLE_PROVIDERS || ['gemini', 'groq'];
  } catch (error) {
    console.error(`${colors.red}Error getting providers from config:${colors.reset}`, error.message);
    console.log(`${colors.yellow}Using hardcoded provider list instead${colors.reset}`);
    return ['gemini', 'groq'];
  }
}

/**
 * Format provider test result
 */
function formatTestResult(result) {
  const status = result.success 
    ? `${colors.green}✓ WORKING${colors.reset}` 
    : `${colors.red}✗ FAILED${colors.reset}`;
  
  const error = result.error 
    ? `\n  ${colors.yellow}Error:${colors.reset} ${result.error}` 
    : '';
  
  return `${status}${error}`;
}

/**
 * Main function to test all providers
 */
async function testAllProviders() {
  console.log(`${colors.cyan}${colors.bright}===== TESTING ALL LLM PROVIDERS =====${colors.reset}\n`);
  
  const providers = await getProvidersToTest();
  
  if (!providers || providers.length === 0) {
    console.log(`${colors.red}No providers found to test.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.yellow}Found ${providers.length} providers to test: ${providers.join(', ')}${colors.reset}\n`);
  
  // Test each provider
  let workingCount = 0;
  
  for (const provider of providers) {
    process.stdout.write(`Testing ${colors.cyan}${provider}${colors.reset}... `);
    
    try {
      const result = await llmService.testLLMProvider(provider);
      console.log(formatTestResult(result));
      
      if (result.success) {
        workingCount++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR${colors.reset}`);
      console.error(`  ${error.message}`);
    }
  }
  
  // Summary
  console.log(`\n${colors.cyan}${colors.bright}===== SUMMARY =====${colors.reset}`);
  console.log(`Total providers: ${providers.length}`);
  console.log(`Working: ${workingCount}`);
  console.log(`Failed: ${providers.length - workingCount}`);
  
  if (workingCount > 0) {
    console.log(`\n${colors.green}You have ${workingCount} working LLM provider(s).${colors.reset}`);
    
    try {
      const currentProvider = config.llm.getCurrentProvider ? config.llm.getCurrentProvider() : null;
      if (currentProvider) {
        console.log(`Current provider: ${colors.cyan}${currentProvider}${colors.reset}`);
      }
    } catch (error) {
      console.log(`Current provider info not available: ${error.message}`);
    }
  } else {
    console.log(`\n${colors.red}${colors.bright}WARNING: No working LLM providers found!${colors.reset}`);
    console.log(`Please check your API keys and provider configurations.`);
  }
}

// Run the tests
testAllProviders()
  .catch(error => {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
    process.exit(1);
  }); 
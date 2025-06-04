# StudySnap Backend Troubleshooting Guide

This document provides solutions for common issues you might encounter when setting up and running the StudySnap backend.

## API Key Authentication Issues

### RapidAPI YouTube Transcript API 403 Error

If you're seeing an error like this:
```
Error from RapidAPI:
Status: 403
Data: { message: 'You are not subscribed to this API.' }
```

**Solution:**

1. Go to [RapidAPI](https://rapidapi.com/) and sign in to your account
2. Search for "YouTube Transcript"
3. Make sure you're subscribing to the API with host: `youtube-transcript3.p.rapidapi.com`
4. Subscribe to the API (they usually have a free tier)
5. Verify your API key in the `.env` file matches the one in your RapidAPI dashboard
6. Test your API key with: `node scripts/test-rapidapi.js`

### Gemini API Key Issues

If you're seeing errors related to the Gemini API like this:
```
Failed to get response from Gemini: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent: [404 Not Found] models/gemini-pro is not found for API version v1
```

**Solution:**

1. Make sure you've created an API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verify your API key in the `.env` file
3. Check that your Google account has access to the Gemini 1.5 Pro model
4. If you don't have access to Gemini 1.5 Pro, try using a different model:
   - Open `src/config/llm.js` and change `model: 'gemini-1.5-pro'` to `model: 'gemini-pro'`
   - Do the same in `src/services/llm/geminiService.js`
5. Ensure your Gemini API key has enough quota remaining

## Environment Variables Not Loading

If environment variables aren't being loaded:

**Solution:**

1. Make sure the `.env` file exists in the project root directory
2. Check that dotenv is installed: `npm install dotenv`
3. Verify your `.env` file has the correct format (no spaces around the `=` sign)
4. Test environment variable loading with: `node scripts/check-env.js`

## Server Won't Start

If the server fails to start:

**Solution:**

1. Check if another process is using the same port (default: 3000)
2. Try specifying a different port in `.env`: `PORT=3001`
3. Ensure all dependencies are installed: `npm install`
4. Check for syntax errors in your code

## Testing Issues

If tests are failing:

**Solution:**

1. Make sure you have a `.env.test` file with test configurations
2. Run tests with verbose output: `npm test -- --verbose`
3. Check that mock data is properly configured in test files

## API Endpoint 404 Errors

If API endpoints return 404:

**Solution:**

1. Verify the URL you're using (e.g., `http://localhost:3000/api/transcript`)
2. Check that the route is properly defined in `src/routes/api.js`
3. Ensure the server is running with `npm run dev`
4. Try using the test script: `node scripts/testApi.js`

## JSON Parsing Errors in LLM Responses

If you're seeing errors like "Failed to parse structured data from LLM response":

**Solution:**

1. Check the prompt templates in `src/services/llm/geminiService.js`
2. Make sure the prompt clearly specifies the format for the response
3. Try reducing the temperature setting in the LLM config (e.g., from 0.2 to 0.1)
4. For debugging, print the raw response before parsing to see what's being returned 
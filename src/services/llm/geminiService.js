/**
 * Google Gemini LLM Service
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');
const { ApiError } = require('../../utils/errorHandler');
const { sanitizeText } = require('../../utils/sanitizer');
const LLMProvider = require('./llmInterface');

class GeminiService extends LLMProvider {
  constructor() {
    super();
    this.config = config.llm.getProviderConfig('gemini');
    
    // Initialize Gemini API client
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    
    // Get model instance
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      },
    });
  }

  /**
   * Prompt templates
   */
  PROMPTS = {
    notes: `
Generate comprehensive notes from this transcript in 5 chapters.
For each chapter:
- Include a clear heading (Chapter 1, Chapter 2, etc.)
- Summarize key points
- Add a chapter summary

Finally, add overall key learning points and takeaways.
Format in markdown with proper headings, bullet points, and structure.

TRANSCRIPT:
    `,
    
    mindmap: `
Create a hierarchical mindmap of key concepts from this transcript.
Structure as JSON with a 'root' representing the main topic and 'children' nodes for subtopics.
Limit to 3 levels of depth and focus on the most important concepts.
The response should be ONLY a valid JSON object with this structure:
{
  "root": "Main Topic",
  "children": [
    {
      "name": "Subtopic 1",
      "children": [
        {
          "name": "Concept 1.1",
          "children": []
        },
        {
          "name": "Concept 1.2",
          "children": []
        }
      ]
    },
    {
      "name": "Subtopic 2",
      "children": [...]
    }
  ]
}

TRANSCRIPT:
    `,
    
    flashcards: `
Create 5 true/false questions based on this transcript.
Each question should:
- Test understanding of an important concept from the transcript
- Include the answer (true/false)
- Provide a clear explanation for why the answer is correct

The response should be ONLY a valid JSON array with this structure:
[
  {
    "question": "Question 1?",
    "answer": true,
    "explanation": "Explanation for answer..."
  },
  {
    "question": "Question 2?",
    "answer": false,
    "explanation": "Explanation for answer..."
  },
  ...
]

TRANSCRIPT:
    `
  };

  /**
   * Call Gemini API with retry logic
   * 
   * @param {string} prompt - Prompt to send to Gemini
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<string>} - Gemini response
   * @throws {ApiError} - If all retries fail
   */
  async callGeminiWithRetry(prompt, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Calling Gemini API (attempt ${i+1}/${maxRetries})...`);
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        return response.text();
      } catch (error) {
        console.error(`Gemini API error (attempt ${i+1}/${maxRetries}):`, error.message);
        lastError = error;
        
        // Wait before retrying (exponential backoff)
        if (i < maxRetries - 1) {
          const backoffMs = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    throw new ApiError(500, `Failed to get response from Gemini: ${lastError.message}`);
  }

  /**
   * Extract JSON from Gemini response
   * 
   * @param {string} text - Raw response text
   * @returns {Object|Array} - Parsed JSON
   * @throws {ApiError} - If JSON parsing fails
   */
  extractJsonFromResponse(text) {
    try {
      // Try to find JSON in the response using regex
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try parsing the whole response
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON from response:', text);
      throw new ApiError(500, 'Failed to parse structured data from LLM response');
    }
  }

  /**
   * Generate smart notes from transcript
   * 
   * @param {string} transcript - Video transcript text
   * @returns {Promise<string>} - Generated notes in markdown format
   */
  async generateNotes(transcript) {
    const prompt = `${this.PROMPTS.notes}${sanitizeText(transcript)}`;
    const response = await this.callGeminiWithRetry(prompt);
    return response;
  }

  /**
   * Generate mindmap structure from transcript
   * 
   * @param {string} transcript - Video transcript text
   * @returns {Promise<Object>} - Hierarchical mindmap structure
   */
  async generateMindmap(transcript) {
    const prompt = `${this.PROMPTS.mindmap}${sanitizeText(transcript)}`;
    const response = await this.callGeminiWithRetry(prompt);
    return this.extractJsonFromResponse(response);
  }

  /**
   * Generate flashcards from transcript
   * 
   * @param {string} transcript - Video transcript text
   * @returns {Promise<Array>} - Array of flashcard objects
   */
  async generateFlashcards(transcript) {
    const prompt = `${this.PROMPTS.flashcards}${sanitizeText(transcript)}`;
    const response = await this.callGeminiWithRetry(prompt);
    return this.extractJsonFromResponse(response);
  }

  /**
   * Generate a simple response to test the provider
   * @returns {Promise<string>} - A simple response
   */
  async generateSample() {
    const prompt = "What is the capital of France?";
    return await this.callGeminiWithRetry(prompt);
  }

  /**
   * Get provider information
   * @returns {Object} - Provider information
   */
  getInfo() {
    return {
      name: this.config.name,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    };
  }
}

module.exports = GeminiService; 
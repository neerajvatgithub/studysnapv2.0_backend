# StudySnap Backend - Implementation Plan

## Project Overview
StudySnap is a Node.js/Express backend service that processes YouTube videos to generate educational content using LLMs. It extracts transcripts and generates smart notes, mindmaps, and flashcards.

## Architecture

### Directory Structure
```
studysnapbackend/
├── src/
│   ├── config/                   # Configuration files
│   │   ├── index.js              # Main config exports
│   │   └── llm.js                # LLM provider configuration
│   ├── controllers/              # Request handlers
│   │   ├── transcriptController.js  # Transcript extraction controller
│   │   ├── notesController.js    # Smart notes generation controller
│   │   ├── mindmapController.js  # Mindmap generation controller
│   │   └── flashcardsController.js # Flashcards generation controller
│   ├── routes/                   # API routes
│   │   └── api.js                # API route definitions
│   ├── services/                 # Business logic
│   │   ├── youtubeService.js     # YouTube URL processing
│   │   ├── transcriptService.js  # Transcript extraction via Supadata/YouTube API
│   │   ├── storageService.js     # Simple in-memory storage with TTL
│   │   └── llm/                  # LLM integration
│   │       ├── index.js          # LLM service factory
│   │       ├── geminiService.js  # Gemini implementation
│   │       ├── openaiService.js  # OpenAI implementation (future)
│   │       └── grokService.js    # Grok implementation (future)
│   ├── utils/                    # Helper functions
│   │   ├── errorHandler.js       # Error handling utilities
│   │   ├── responseFormatter.js  # Response formatting utilities
│   │   └── sanitizer.js          # Input sanitization utilities
│   ├── middleware/               # Express middleware
│   │   ├── errorMiddleware.js    # Error handling middleware
│   │   ├── validationMiddleware.js # Input validation middleware
│   │   ├── rateLimitMiddleware.js # Rate limiting middleware
│   │   └── securityMiddleware.js # Security headers middleware
│   └── app.js                    # Express app setup
├── .env.example                  # Example environment variables (no secrets)
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies
├── server.js                     # Entry point
└── README.md                     # Documentation
```

## Core Features

### 1. Transcript Extraction
- Extract YouTube video ID from URL
- Call Transcript API to get transcript
- Store transcript in memory with TTL
- Support optional session identifiers
- Validate and sanitize input URLs

### 2. Smart Notes Generation
- Format transcript for LLM processing
- Generate structured notes with:
  - 5 chapters
  - Key learning points for each chapter
  - Chapter summaries
  - Overall takeaways
- Return formatted markdown

### 3. Mindmap Generation
- Process transcript with LLM
- Generate hierarchical structure representing key concepts
- Return JSON structure suitable for frontend visualization
- Validate output format

### 4. Flashcards Generation
- Process transcript with LLM
- Generate 5 true/false questions with explanations
- Return structured JSON for frontend rendering

## API Endpoints

### 1. Transcript Extraction
- **Endpoint**: `POST /api/transcript`
- **Input**: 
  ```json
  {
    "url": "https://www.youtube.com/watch?v=videoId",
    "sessionId": "optional-session-identifier"
  }
  ```
- **Output**: 
  ```json
  {
    "success": true,
    "data": {
      "videoId": "videoId",
      "transcript": "Full transcript text...",
      "title": "Video title",
      "duration": "Video duration in seconds"
    }
  }
  ```
- **Process**: Extract YouTube video ID, check cache, if not found fetch transcript using Supadata/Parid API, store in cache, return transcript

### 2. Smart Notes Generation
- **Endpoint**: `POST /api/notes`
- **Input**: 
  ```json
  {
    "url": "https://www.youtube.com/watch?v=videoId",
    "transcript": "Optional transcript if already fetched",
    "sessionId": "optional-session-identifier"
  }
  ```
- **Output**: 
  ```json
  {
    "success": true,
    "data": {
      "videoId": "videoId",
      "title": "Video title",
      "notes": "# Chapter 1\n...\n# Chapter 5\n...\n## Key Learning Points\n...\n## Summary\n...\n## Takeaways\n..."
    }
  }
  ```
- **Process**: Get transcript (from input or by fetching), send to LLM API with structured prompt, return formatted notes

### 3. Mindmap Generation
- **Endpoint**: `POST /api/mindmap`
- **Input**: 
  ```json
  {
    "url": "https://www.youtube.com/watch?v=videoId",
    "transcript": "Optional transcript if already fetched",
    "sessionId": "optional-session-identifier"
  }
  ```
- **Output**: 
  ```json
  {
    "success": true,
    "data": {
      "videoId": "videoId",
      "title": "Video title",
      "mindmap": {
        "root": "Main Topic",
        "children": [
          {
            "name": "Subtopic 1",
            "children": [...]
          },
          ...
        ]
      }
    }
  }
  ```
- **Process**: Get transcript, send to LLM API with mindmap prompt, return JSON structure for mindmap

### 4. Flashcards Generation
- **Endpoint**: `POST /api/flashcards`
- **Input**: 
  ```json
  {
    "url": "https://www.youtube.com/watch?v=videoId",
    "transcript": "Optional transcript if already fetched",
    "sessionId": "optional-session-identifier"
  }
  ```
- **Output**: 
  ```json
  {
    "success": true,
    "data": {
      "videoId": "videoId",
      "title": "Video title",
      "flashcards": [
        {
          "question": "Question 1?",
          "answer": true,
          "explanation": "Explanation for answer..."
        },
        ...
      ]
    }
  }
  ```
- **Process**: Get transcript, send to LLM API with flashcard prompt, return array of question objects

## Key Components

### Transcript Storage
- **Implementation**: In-memory Map with TTL
- **Key**: `videoId + (sessionId || '')`
- **Value**: `{transcript, timestamp, title, duration}`
- **Cleanup**: Auto-remove entries older than 30 minutes
- **Benefit**: Efficient reuse of transcripts across endpoints

### LLM Service Factory
- **Pattern**: Factory design pattern
- **Default**: Gemini API
- **Extensibility**: Common interface for all LLM providers
- **Configuration**: Environment variables to select provider
- **Error handling**: Graceful fallback mechanisms

### Prompt Templates
- **Notes Template**:
  ```
  Generate comprehensive notes from this transcript in 5 chapters.
  For each chapter:
  - Include a clear heading
  - Summarize key points
  - Add a chapter summary
  Finally, add overall key learning points and takeaways.
  Format in markdown.
  ```

- **Mindmap Template**:
  ```
  Create a hierarchical mindmap of concepts from this transcript.
  Structure as JSON with 'root' and 'children' nodes.
  Limit to 3 levels of depth and focus on key concepts.
  ```

- **Flashcards Template**:
  ```
  Create 5 true/false questions based on this transcript.
  Each question should:
  - Test understanding of an important concept
  - Include the answer (true/false)
  - Provide a clear explanation
  Return as JSON array.
  ```

## Implementation Plan

### Phase 1: Core Setup (Days 1-2)
1. Initialize Node.js project and install dependencies
2. Set up Express server and basic middleware
3. Implement YouTube URL parsing and validation
4. Create basic API routes
5. Set up security middleware

### Phase 2: Transcript Service (Days 3-4)
1. Implement Supadata/Parid API integration
2. Create in-memory storage service
3. Build transcript controller and route
4. Add input validation and sanitization

### Phase 3: LLM Integration (Days 5-7)
1. Implement Gemini API client
2. Create LLM factory service
3. Develop prompt templates
4. Add error handling and retry logic

### Phase 4: Content Generation (Days 8-12)
1. Implement notes generation endpoint
2. Implement mindmap generation endpoint
3. Implement flashcards generation endpoint
4. Add request validation and output sanitization

### Phase 5: Testing & Refinement (Days 13-14)
1. Add comprehensive error handling
2. Implement request logging
3. Performance testing
4. Security review
5. Documentation updates

## Security Best Practices

### Input Validation & Sanitization
- Validate all input parameters using Joi or similar library
- Sanitize YouTube URLs to prevent injection attacks
- Implement strict type checking
- Validate session identifiers

### API Security
- Implement rate limiting (express-rate-limit)
- Add security headers (helmet.js)
- Implement proper CORS configuration
- Consider adding API key validation for production

### LLM Security
- Sanitize inputs to LLM to prevent prompt injection
- Implement output scanning for harmful content
- Set maximum token limits to prevent excessive costs
- Add circuit breakers for LLM API calls

### Data Protection
- Do not log sensitive information or full transcripts
- Implement proper TTL for cached data
- Use secure environment variables for API keys
- Consider encryption for sensitive data in transit

### Error Handling
- Implement global error handler
- Return appropriate HTTP status codes
- Avoid exposing internal error details to clients
- Log errors securely for debugging

## Coding Best Practices

### Code Organization
- Use consistent naming conventions
- Implement modular architecture (separation of concerns)
- Follow the repository pattern for data access
- Use dependency injection for better testability

### Asynchronous Handling
- Use async/await consistently
- Implement proper error handling for async operations
- Consider using Promise.allSettled for parallel operations
- Add timeouts to external API calls

### Performance
- Implement caching strategies
- Use streaming for large responses
- Add compression middleware
- Consider pagination for large datasets

### Testing
- Unit tests for core business logic
- Integration tests for API endpoints
- Load testing for concurrent users
- Mocking external dependencies

### Maintainability
- Add comprehensive documentation
- Use TypeScript for type safety (optional)
- Implement consistent error codes
- Add health check endpoint

## Dependencies
- **Express**: Web framework
- **Axios**: HTTP client for API requests
- **Dotenv**: Environment variable management
- **Joi**: Request validation
- **Helmet**: Security headers
- **Express-rate-limit**: Rate limiting
- **Node-cache**: For in-memory caching (optional)
- **Winston**: Logging
- **@google/generative-ai**: Gemini API client
- **Youtube-transcript-api** or **Supadata API**: For transcript extraction
- **Cors**: CORS support
- **Express-validator**: Input validation and sanitization

## Future Extensions
- Database integration for persistent storage
- User authentication and management
- Rate limiting by user
- Additional LLM providers
- More output formats (quizzes, summaries, etc.)
- Cache optimization
- Streaming responses for large outputs
- Frontend integration examples
- Webhook support for async processing
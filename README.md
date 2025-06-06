# StudySnap Backend

A Node.js/Express backend service that processes YouTube videos to generate educational content using LLMs. It extracts transcripts and generates smart notes, mindmaps, and flashcards.

## Features

- **Transcript Extraction**: Extract YouTube video transcripts using RapidAPI
- **Smart Notes Generation**: Generate structured notes from video content
- **Mindmap Generation**: Create hierarchical mindmaps representing key concepts
- **Flashcards Generation**: Generate true/false questions with explanations
- **Multiple LLM Providers**: Support for multiple LLM providers (Gemini, Groq)
- **Admin Controls**: API endpoints to manage LLM providers
- **Supabase Authentication**: JWT-based authentication system
- **Token-Based Usage**: Free and premium user tiers with token allocation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/studysnapbackend.git
cd studysnapbackend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env
# Then edit .env and add your API keys
```

## Configuration

Edit the `.env` file and provide the following:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `GROQ_API_KEY`: Your Groq API key
- `RAPIDAPI_KEY`: Your RapidAPI key for YouTube Transcript API
- `LLM_PROVIDER`: The LLM provider to use (default: gemini)
- `PORT`: Port for the server (default: 3000)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `TOKENS_PER_VIDEO`: Tokens consumed per video (default: 10)
- `FREE_USER_TOKENS`: Monthly tokens for free users (default: 50)
- `PREMIUM_USER_TOKENS`: Monthly tokens for premium users (default: 300)

## API Keys Setup

### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" and copy the generated key
4. Add this key to your `.env` file as `GEMINI_API_KEY`
5. Make sure your account has access to the Gemini 1.5 Flash model

### Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign in or create an account
3. Generate a new API key
4. Add this key to your `.env` file as `GROQ_API_KEY`

### RapidAPI Key

1. Sign up for a [RapidAPI](https://rapidapi.com/) account
2. Subscribe to the [YouTube Transcript API](https://rapidapi.com/search/youtube%20transcript)
3. Make sure you're subscribing to the API with the host: `youtube-transcript3.p.rapidapi.com`
4. Get your API key from the RapidAPI dashboard
5. Add your API key to the `.env` file as `RAPIDAPI_KEY`

### Supabase Setup

1. Create a project on [Supabase](https://supabase.com/)
2. Get your project URL and service role key from the API settings
3. Add these to your `.env` file as `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
4. Run the SQL scripts in `supabase-schema.sql` in your Supabase SQL editor

## Usage

### Start the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Testing Supabase Connection

```bash
# Test Supabase connection
node scripts/test-supabase.js

# Test authentication middleware
node scripts/test-auth-middleware.js

# Test token service
node scripts/test-token-service.js
```

### API Endpoints

All endpoints now require authentication via Supabase JWT token in the Authorization header:

```
Authorization: Bearer your-supabase-jwt-token
```

#### 1. Get Transcript

```
POST /api/transcript

Body:
{
  "url": "https://www.youtube.com/watch?v=videoId",
  "sessionId": "optional-session-identifier"
}
```

#### 2. Generate Notes

```
POST /api/notes

Body:
{
  "url": "https://www.youtube.com/watch?v=videoId",
  "transcript": "Optional transcript if already fetched",
  "sessionId": "optional-session-identifier"
}
```

#### 3. Generate Mindmap

```
POST /api/mindmap

Body:
{
  "url": "https://www.youtube.com/watch?v=videoId",
  "transcript": "Optional transcript if already fetched",
  "sessionId": "optional-session-identifier"
}
```

#### 4. Generate Flashcards

```
POST /api/flashcards

Body:
{
  "url": "https://www.youtube.com/watch?v=videoId",
  "transcript": "Optional transcript if already fetched",
  "sessionId": "optional-session-identifier"
}
```

### Admin Endpoints

#### 1. Get Current LLM Provider

```
GET /api/admin/llm
```

#### 2. Change LLM Provider

```
POST /api/admin/llm

Body:
{
  "provider": "gemini" or "groq"
}
```

#### 3. Get All Available LLM Providers

```
GET /api/admin/llm/all
```

#### 4. Test LLM Provider

```
POST /api/admin/llm/test

Body:
{
  "provider": "gemini" or "groq"
}
```

## Subscription Model

The application uses a token-based subscription model:

- **Free tier**: 50 tokens per month
- **Premium tier**: 300 tokens per month ($4.99)
- **Token usage**: Each 30-minute video conversion consumes 10 tokens

For detailed documentation on:
- Authentication and token management, see [AUTHENTICATION.md](AUTHENTICATION.md)
- Database schema and recent changes, see [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only API tests
npm run test:api
```

## Project Structure

```
studysnapbackend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   └── llm/          # LLM integrations
│   ├── utils/            # Helper functions
│   ├── middleware/       # Express middleware
│   └── app.js            # Express app setup
├── __tests__/            # Tests
├── .env.example          # Example environment variables
├── package.json          # Dependencies
├── server.js             # Entry point
└── README.md             # Documentation
```

## Troubleshooting

If you encounter any issues, please refer to the TROUBLESHOOTING.md file for common solutions.

## License

ISC 
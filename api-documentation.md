# StudySnap API Documentation

This document provides details about all available API endpoints in the StudySnap application, along with example curl commands for testing and integration.

## Base URL
```
http://localhost:3000/api
```

Replace this with your actual API host when deploying to production.

## Authentication
Currently, the API doesn't require authentication but uses rate limiting to prevent abuse.

## Common Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| url | string | Required. A valid YouTube URL. |
| sessionId | string | Optional. A unique identifier to manage session state. |
| transcript | string | Optional. A pre-fetched transcript if available. |

## Response Format
All endpoints return responses in the following format:

```json
{
  "success": true,
  "data": {
    // Response data specific to each endpoint
  }
}
```

## Error Format
Errors are returned in the following format:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error message details"
  }
}
```

---

## Feature Endpoints

### 1. Get Transcript
Fetches the transcript for a YouTube video.

**Endpoint:** `POST /transcript`

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video Title",
    "transcript": "Full transcript text...",
    "duration": 213
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/api/transcript \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "sessionId": "user123"
  }'
```

### 2. Generate Notes
Generates comprehensive notes from a video transcript.

**Endpoint:** `POST /notes`

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "transcript": "Optional pre-fetched transcript...",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video Title",
    "notes": "# Chapter 1\n\n- Key point 1\n- Key point 2\n\n## Summary\nChapter summary here...\n\n# Chapter 2\n..."
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "sessionId": "user123"
  }'
```

### 3. Generate Mindmap
Creates a hierarchical mindmap from a video transcript.

**Endpoint:** `POST /mindmap`

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "transcript": "Optional pre-fetched transcript...",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video Title",
    "mindmap": {
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
          "children": []
        }
      ]
    }
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/api/mindmap \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "sessionId": "user123"
  }'
```

### 4. Generate Flashcards
Generates flashcards based on video content.

**Endpoint:** `POST /flashcards`

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "transcript": "Optional pre-fetched transcript...",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video Title",
    "flashcards": [
      {
        "question": "Question 1?",
        "answer": true,
        "explanation": "Explanation for answer..."
      },
      {
        "question": "Question 2?",
        "answer": false,
        "explanation": "Explanation for answer..."
      }
    ]
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "sessionId": "user123"
  }'
```

---

## Admin Endpoints

### 1. Get Current LLM Provider
Retrieves information about the currently active LLM provider.

**Endpoint:** `GET /admin/llm`

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "gemini",
    "model": "gemini-1.5-flash",
    "maxTokens": 8192,
    "temperature": 0.2
  }
}
```

**Example curl:**
```bash
curl -X GET http://localhost:3000/api/admin/llm
```

### 2. Change LLM Provider
Changes the active LLM provider.

**Endpoint:** `POST /admin/llm`

**Request Body:**
```json
{
  "provider": "groq"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "groq",
    "model": "llama-3.3-70b-versatile",
    "previous": "gemini"
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/api/admin/llm \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "groq"
  }'
```

### 3. List All LLM Providers
Lists all available LLM providers with their configurations.

**Endpoint:** `GET /admin/llm/all`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "gemini",
      "current": true,
      "config": {
        "name": "gemini",
        "model": "gemini-1.5-flash",
        "maxTokens": 8192,
        "temperature": 0.2
      }
    },
    {
      "name": "groq",
      "current": false,
      "config": {
        "name": "groq",
        "model": "llama-3.3-70b-versatile",
        "maxTokens": 4096,
        "temperature": 0.7
      }
    }
  ]
}
```

**Example curl:**
```bash
curl -X GET http://localhost:3000/api/admin/llm/all
```

### 4. Test LLM Provider
Tests a specific LLM provider to verify it's working correctly.

**Endpoint:** `POST /admin/llm/test`

**Request Body:**
```json
{
  "provider": "gemini"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "working": true,
    "provider": "gemini",
    "response": "Paris",
    "responseTime": "1.2s"
  }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3000/api/admin/llm/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini"
  }'
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - The request was malformed or contained invalid parameters |
| 404 | Not Found - The requested resource was not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong on the server |

## Rate Limiting
The API has a rate limit of 100 requests per 15 minutes per IP address.

## Processing Status

All processing endpoints (/transcript, /notes, /mindmap, /flashcards) now track the status of the processing. Status values include:

| Status | Description |
|--------|-------------|
| processing | Processing is in progress |
| success | Processing completed successfully |
| failed | Processing failed (error message will be included) |

## History Endpoints

### Get User's Processing History

Retrieves the user's video processing history.

```
GET /api/history
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Optional. Number of items to return (default: 20) |
| offset | number | Optional. Offset for pagination (default: 0) |
| status | string | Optional. Filter by status (processing, success, failed) |

#### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "user_id": "user-uuid",
        "video_id": "youtube-video-id",
        "video_url": "https://www.youtube.com/watch?v=video-id",
        "title": "Video Title",
        "output_type": "notes|mindmap|flashcards|transcript",
        "status": "processing|success|failed",
        "error_message": null,
        "created_at": "2025-06-05T12:00:00Z"
      }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

### Get User's Processing Statistics

Retrieves statistics about the user's video processing.

```
GET /api/history/stats
```

#### Response

```json
{
  "success": true,
  "data": {
    "byStatus": {
      "processing": 2,
      "success": 38,
      "failed": 2
    },
    "byType": {
      "transcript": 10,
      "notes": 15,
      "mindmap": 10,
      "flashcards": 7
    }
  }
}
``` 
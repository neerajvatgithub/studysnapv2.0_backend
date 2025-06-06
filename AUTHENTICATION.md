# Authentication Implementation Guide

This guide explains how authentication is implemented in the StudySnap backend using Supabase, and how to test and troubleshoot it.

## Overview

StudySnap uses Supabase for authentication and user management. The system implements:

1. **JWT-based authentication** - All API endpoints require a valid Supabase JWT token
2. **Token-based usage system** - Users consume tokens for video processing
3. **Free and premium user tiers** - Different token allocations based on subscription

## Setup

### 1. Environment Configuration

Create a `.env` file with the following Supabase-related variables:

```
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Token System Configuration
TOKENS_PER_VIDEO=10
FREE_USER_TOKENS=50
PREMIUM_USER_TOKENS=300
```

### 2. Database Schema Setup

Run the SQL statements in `supabase-schema.sql` in your Supabase SQL editor to set up:
- The `profiles` table for user information and token balances
- The `video_usage` table to track token consumption
- Row-level security policies
- Triggers for automatically creating profiles for new users

## Testing the Implementation

We've created several test scripts to verify the implementation:

### Test Supabase Connection

```bash
node scripts/test-supabase.js
```

This script verifies that your backend can connect to Supabase using the configured credentials.

### Test Auth Middleware

```bash
node scripts/test-auth-middleware.js
```

This script tests the authentication middleware with various scenarios.

### Test Token Service

```bash
node scripts/test-token-service.js
```

This script tests the token management service to ensure tokens are properly tracked and deducted.

## User Flows

### Registration and Initial Token Allocation

1. User registers via the frontend (using Supabase Auth UI or custom implementation)
2. Supabase trigger automatically creates a profile with the default free tier tokens (50)
3. User can start using the app immediately

### Token Consumption

1. User requests to process a video (transcript, notes, mindmap, flashcards)
2. Backend verifies user's JWT token using the auth middleware
3. Token service checks if user has sufficient tokens
4. If sufficient, tokens are deducted and video is processed
5. Usage is recorded in the `video_usage` table

### Subscription Management

When a user upgrades to premium:
1. Update the `plan_type` in the `profiles` table to 'premium'
2. Update the `tokens_remaining` to premium level (300)
3. Set the `subscription_ends_at` field with the subscription end date

## Test User Account

A test user account has been created for development and testing purposes:

- **Email**: meetneerajv@gmail.com
- **Password**: StudySnap123!
- **Plan Type**: free
- **Tokens**: 50 (default free tier allocation)

You can use the following scripts to manage the test user:

```bash
# Check the user's token information and plan type
node scripts/check-user-tokens.js

# Update the user's plan type and token count
node scripts/update-user-tier.js

# Test authentication with proper headers
node scripts/test-user-auth.js
```

## Authentication Headers

When making API requests, include both of these headers:

```
Authorization: Bearer <user_jwt_token>
apikey: <supabase_anon_key>
```

Both headers are required by Supabase for proper JWT verification on the server side.

## Troubleshooting

### Common Issues

1. **Invalid JWT Token**: Make sure the token is properly passed from the frontend with the Bearer prefix
2. **Connection Issues**: Check the SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file
3. **Missing Tables**: Ensure you've run the database schema setup SQL
4. **Insufficient Tokens**: Check if the user has enough tokens for the requested operation

### Debug Logs

Enable debug logging to see more detailed information:

```javascript
// Add to your .env file
DEBUG=true
```

## API Endpoint Authentication

All API endpoints require authentication:

- POST /api/transcript
- POST /api/notes
- POST /api/mindmap
- POST /api/flashcards

The frontend must include the Supabase access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
``` 
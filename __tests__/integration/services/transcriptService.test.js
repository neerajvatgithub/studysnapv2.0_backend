const { getTranscript } = require('../../../src/services/transcriptService');
const storageService = require('../../../src/services/storageService');
const nock = require('nock');

// Mock environment variables
process.env.RAPIDAPI_KEY = 'test-api-key';

describe('Transcript Service Integration', () => {
  beforeEach(() => {
    // Clear cache between tests
    storageService.clear();
    
    // Clear nock interceptors
    nock.cleanAll();
  });
  
  test('fetches and caches transcript', async () => {
    const videoId = 'dQw4w9WgXcQ';
    
    // Mock RapidAPI response
    nock('https://youtube-transcript-api.p.rapidapi.com')
      .get('/retrieve')
      .query({ videoId })
      .reply(200, [
        { 
          text: 'This is the first part of the transcript.', 
          offset: 0,
          duration: 5000 
        },
        { 
          text: 'This is the second part of the transcript.', 
          offset: 5000,
          duration: 5000 
        }
      ]);
    
    const result = await getTranscript(videoId);
    
    // Verify response structure
    expect(result).toHaveProperty('transcript');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('duration');
    
    // Verify transcript content
    expect(result.transcript).toContain('first part');
    expect(result.transcript).toContain('second part');
    
    // Verify it's cached
    expect(storageService.get(videoId)).toBeTruthy();
  });
  
  test('returns cached transcript when available', async () => {
    const videoId = 'cached-video';
    const cachedData = {
      transcript: 'Cached transcript',
      title: 'Cached Video',
      duration: 120
    };
    
    // Pre-populate cache
    storageService.set(videoId, cachedData);
    
    // This would fail if it tried to fetch from API
    const result = await getTranscript(videoId);
    
    // Verify we got cached data
    expect(result).toEqual(cachedData);
  });
  
  test('handles API errors gracefully', async () => {
    const videoId = 'error-video';
    
    // Mock API error response
    nock('https://youtube-transcript-api.p.rapidapi.com')
      .get('/retrieve')
      .query({ videoId })
      .reply(404);
    
    // Expect the function to throw an error
    await expect(getTranscript(videoId)).rejects.toThrow('Transcript not found');
  });
}); 
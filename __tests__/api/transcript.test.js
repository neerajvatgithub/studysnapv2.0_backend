const request = require('supertest');
const app = require('../../src/app');
const nock = require('nock');

// Mock environment variables
process.env.RAPIDAPI_KEY = 'test-api-key';

describe('Transcript API', () => {
  beforeEach(() => {
    // Clear nock interceptors
    nock.cleanAll();
  });
  
  test('POST /api/transcript returns transcript data', async () => {
    const videoId = 'dQw4w9WgXcQ';
    
    // Mock RapidAPI response
    nock('https://youtube-transcript-api.p.rapidapi.com')
      .get('/retrieve')
      .query({ videoId })
      .reply(200, [
        { 
          text: 'This is a test transcript.', 
          offset: 0,
          duration: 5000 
        }
      ]);
      
    const response = await request(app)
      .post('/api/transcript')
      .send({ url: `https://www.youtube.com/watch?v=${videoId}` });
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('transcript');
    expect(response.body.data).toHaveProperty('videoId', videoId);
  });
  
  test('POST /api/transcript with invalid URL returns 400', async () => {
    const response = await request(app)
      .post('/api/transcript')
      .send({ url: 'invalid-url' });
      
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
  
  test('POST /api/transcript with missing URL returns 400', async () => {
    const response = await request(app)
      .post('/api/transcript')
      .send({});
      
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
}); 
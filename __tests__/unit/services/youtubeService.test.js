const { getVideoId, getStorageKey } = require('../../../src/services/youtubeService');

describe('YouTube Service', () => {
  describe('getVideoId', () => {
    test('extracts video ID from standard URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
    });
    
    test('extracts video ID from shortened URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
    });
    
    test('returns null for invalid URL', () => {
      const url = 'https://example.com';
      expect(getVideoId(url)).toBeNull();
    });
    
    test('handles URL with additional parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s';
      expect(getVideoId(url)).toBe('dQw4w9WgXcQ');
    });
  });
  
  describe('getStorageKey', () => {
    test('returns videoId when no sessionId is provided', () => {
      const videoId = 'dQw4w9WgXcQ';
      expect(getStorageKey(videoId)).toBe('dQw4w9WgXcQ');
    });
    
    test('combines videoId and sessionId when sessionId is provided', () => {
      const videoId = 'dQw4w9WgXcQ';
      const sessionId = 'test-session';
      expect(getStorageKey(videoId, sessionId)).toBe('dQw4w9WgXcQ_test-session');
    });
  });
}); 
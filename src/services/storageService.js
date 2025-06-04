/**
 * Simple in-memory storage service with TTL
 */

// Default TTL in minutes
const DEFAULT_TTL = process.env.TRANSCRIPT_TTL_MINUTES || 30;

// In-memory storage Map
const storage = new Map();

/**
 * Store data with TTL
 * 
 * @param {string} key - Storage key
 * @param {any} value - Data to store
 * @param {number} ttl - Time to live in minutes (optional)
 */
const set = (key, value, ttl = DEFAULT_TTL) => {
  // Convert TTL to milliseconds
  const ttlMs = ttl * 60 * 1000;
  const expiresAt = Date.now() + ttlMs;
  
  storage.set(key, {
    value,
    expiresAt
  });
};

/**
 * Retrieve data if not expired
 * 
 * @param {string} key - Storage key
 * @returns {any|null} - Stored value or null if expired/not found
 */
const get = (key) => {
  const item = storage.get(key);
  
  if (!item) {
    return null;
  }
  
  // Check if item is expired
  if (item.expiresAt < Date.now()) {
    storage.delete(key);
    return null;
  }
  
  return item.value;
};

/**
 * Delete data by key
 * 
 * @param {string} key - Storage key
 */
const remove = (key) => {
  storage.delete(key);
};

/**
 * Clear all stored data
 */
const clear = () => {
  storage.clear();
};

/**
 * Clean up expired items
 * Should be called periodically (e.g., via a timer)
 */
const cleanup = () => {
  const now = Date.now();
  
  for (const [key, item] of storage.entries()) {
    if (item.expiresAt < now) {
      storage.delete(key);
    }
  }
};

// Set up cleanup interval (every 5 minutes)
setInterval(cleanup, 5 * 60 * 1000);

module.exports = {
  set,
  get,
  remove,
  clear,
  cleanup
}; 
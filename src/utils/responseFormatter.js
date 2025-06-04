/**
 * Standardized response formatting
 */

/**
 * Creates a successful response object
 * 
 * @param {any} data - Response data
 * @returns {Object} - Formatted success response
 */
const formatSuccess = (data) => {
  return {
    success: true,
    data
  };
};

/**
 * Creates an error response object
 * 
 * @param {number} code - HTTP status code
 * @param {string} message - Error message
 * @returns {Object} - Formatted error response
 */
const formatError = (code, message) => {
  return {
    success: false,
    error: {
      code,
      message
    }
  };
};

module.exports = {
  formatSuccess,
  formatError
}; 
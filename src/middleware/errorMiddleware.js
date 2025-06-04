/**
 * Global error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  // Set default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error for debugging (in production, use a proper logger)
  console.error(`Error ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Return standardized error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'An unexpected error occurred' 
        : message
    }
  });
};

module.exports = errorMiddleware; 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import middleware
const errorMiddleware = require('./middleware/errorMiddleware');
const securityMiddleware = require('./middleware/securityMiddleware');

// Import routes
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Apply security middleware
app.use(securityMiddleware);

// Set up routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply error handling middleware
app.use(errorMiddleware);

module.exports = app; 
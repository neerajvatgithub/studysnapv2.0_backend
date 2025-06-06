/**
 * Authentication Middleware using Supabase JWT
 */
const supabase = require('../config/supabase');
const { ApiError } = require('../utils/errorHandler');
const { createClient } = require('@supabase/supabase-js');

/**
 * Verifies Supabase JWT token and extracts user information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyAuth = async (req, res, next) => {
  try {
    // Debug: Log all request headers to help with diagnosis
    console.log('🔍 Auth Debug - All Headers:', Object.keys(req.headers).reduce((acc, key) => {
      acc[key] = key.toLowerCase() === 'authorization' 
        ? `${req.headers[key].substring(0, 20)}...` 
        : req.headers[key];
      return acc;
    }, {}));
    
    const authHeader = req.headers.authorization;
    const apiKey = req.headers.apikey || process.env.SUPABASE_ANON_KEY;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth Debug - Invalid header format');
      throw new ApiError(401, 'Authentication required');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Debug: Log token info
    console.log('🔍 Auth Debug - Token:', token.substring(0, 20) + '...');
    console.log('🔍 Auth Debug - API Key present:', !!apiKey);
    
    // Parse token to check basics (without verification)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('🔍 Auth Debug - Token payload:', {
          sub: payload.sub,
          role: payload.role,
          exp: new Date(payload.exp * 1000).toLocaleString(),
          session_id: payload.session_id
        });
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          console.log('❌ Auth Debug - Token is expired');
        }
      }
    } catch (parseError) {
      console.log('❌ Auth Debug - Error parsing token:', parseError.message);
    }
    
    // Verify token with Supabase
    console.log('🔍 Auth Debug - Verifying token with Supabase...');
    console.log('🔍 Auth Debug - Using getUser() method as recommended by Supabase for server-side auth');
    
    // IMPORTANT: Create a fresh client with the anon key from the request
    // This is important because as per Supabase docs, we need both the apikey and Bearer token
    let clientToUse = supabase;
    
    // If an apikey was provided in the request headers, create a fresh client with it
    if (apiKey && apiKey !== process.env.SUPABASE_SERVICE_KEY) {
      console.log('🔍 Auth Debug - Creating fresh client with provided apikey');
      clientToUse = createClient(process.env.SUPABASE_URL, apiKey);
    }
    
    // Verify the token
    const { data, error } = await clientToUse.auth.getUser(token);
    
    // Debug: Log verification results
    if (error) {
      console.log('❌ Auth Debug - Token verification failed:', error.message);
      console.log('   Error details:', JSON.stringify(error));
      throw new ApiError(401, 'Invalid or expired token');
    } 
    
    if (!data || !data.user) {
      console.log('❌ Auth Debug - No user returned from token verification');
      throw new ApiError(401, 'User not found');
    }
    
    console.log('✅ Auth Debug - Token verification successful!');
    console.log('   User ID:', data.user.id);
    console.log('   User Email:', data.user.email);
    
    // Add user to request object
    req.user = data.user;
    req.userId = data.user.id;
    
    next();
  } catch (error) {
    console.log('❌ Auth Debug - Authentication error:', error.message);
    
    res.status(error.statusCode || 401).json({
      success: false,
      error: {
        message: error.message || 'Authentication failed'
      }
    });
  }
};

module.exports = {
  verifyAuth
}; 
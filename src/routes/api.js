/**
 * API Routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
const transcriptController = require('../controllers/transcript.controller');
const notesController = require('../controllers/notes.controller');
const mindmapController = require('../controllers/mindmap.controller');
const flashcardsController = require('../controllers/flashcards.controller');
const adminController = require('../controllers/admin.controller');
const historyController = require('../controllers/history.controller');

// Import middleware
const { validateUrl } = require('../middleware/validationMiddleware');
const { verifyAuth } = require('../middleware/authMiddleware');

// TEMPORARY DEBUG ENDPOINT - Remove in production
const supabase = require('../config/supabase');
router.get('/debug-auth', async (req, res) => {
  try {
    console.log('🔍 Debug endpoint called');
    
    // Check if we can connect to Supabase
    const { data: version, error: versionError } = await supabase.rpc('version');
    
    // Extract token if provided
    let tokenInfo = 'No token provided';
    let userData = null;
    let tokenError = null;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      tokenInfo = `Token provided (first 15 chars): ${token.substring(0, 15)}...`;
      
      // Try to verify the token
      const { data, error } = await supabase.auth.getUser(token);
      userData = data?.user;
      tokenError = error;
    }
    
    res.status(200).json({
      success: true,
      message: 'Debug info',
      supabase: {
        url: process.env.SUPABASE_URL,
        serviceKeyPrefix: process.env.SUPABASE_SERVICE_KEY.substring(0, 10) + '...',
        connectionTest: versionError ? 'Failed' : 'Success',
        version: version
      },
      token: {
        info: tokenInfo,
        verified: !!userData,
        error: tokenError ? tokenError.message : null
      },
      user: userData ? {
        id: userData.id,
        email: userData.email,
        role: userData.role
      } : null
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// Define routes - all protected with auth
router.post('/transcript', verifyAuth, validateUrl, transcriptController.getTranscript);
router.post('/notes', verifyAuth, validateUrl, notesController.generateNotes);
router.post('/mindmap', verifyAuth, validateUrl, mindmapController.generateMindmap);
router.post('/flashcards', verifyAuth, validateUrl, flashcardsController.generateFlashcards);

// History routes
router.get('/history', verifyAuth, historyController.getUserHistory);
router.get('/history/stats', verifyAuth, historyController.getUserStats);

// Admin routes
router.get('/admin/llm', adminController.getCurrentLLMProvider);
router.post('/admin/llm', adminController.changeLLMProvider);
router.get('/admin/llm/all', adminController.getAllLLMProviders);
router.post('/admin/llm/test', adminController.testLLMProvider);

module.exports = router; 
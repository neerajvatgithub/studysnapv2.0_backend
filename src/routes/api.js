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

// Validation middleware
const { validateUrl } = require('../middleware/validationMiddleware');

// Define routes
router.post('/transcript', validateUrl, transcriptController.getTranscript);
router.post('/notes', validateUrl, notesController.generateNotes);
router.post('/mindmap', validateUrl, mindmapController.generateMindmap);
router.post('/flashcards', validateUrl, flashcardsController.generateFlashcards);

// Admin routes
router.get('/admin/llm', adminController.getCurrentLLMProvider);
router.post('/admin/llm', adminController.changeLLMProvider);
router.get('/admin/llm/all', adminController.getAllLLMProviders);
router.post('/admin/llm/test', adminController.testLLMProvider);

module.exports = router; 
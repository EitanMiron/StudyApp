const express = require('express');
const router = express.Router();
const { 
    handleChat, 
    generateNote, 
    generateFlashcards, 
    explainConcept 
} = require('../controllers/aiController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/chat', authenticateToken, handleChat);
router.post('/generate-note', authenticateToken, generateNote);
router.post('/generate-flashcards', authenticateToken, generateFlashcards);
router.post('/explain-concept', authenticateToken, explainConcept);

module.exports = router; 
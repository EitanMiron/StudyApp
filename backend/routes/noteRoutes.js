const express = require('express');
const noteController = require('../controllers/noteController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Personal Notes Routes
router.post('/user/notes', authenticateToken, noteController.createPersonalNote);
router.get('/user/notes', authenticateToken, noteController.getPersonalNotes);
router.get('/user/notes/:noteID', authenticateToken, noteController.getPersonalNoteById);
router.put('/user/notes/:noteID', authenticateToken, noteController.updatePersonalNote);
router.delete('/user/notes/:noteID', authenticateToken, noteController.deletePersonalNote);

// Group Notes Routes
router.post('/groups/:id/notes', authenticateToken, noteController.createNote);
router.get('/groups/:id/notes', authenticateToken, noteController.getAllNotes);
router.get('/groups/:id/notes/:noteID', authenticateToken, noteController.getNoteById);
router.put('/groups/:id/notes/:noteID', authenticateToken, noteController.updateNote);
router.delete('/groups/:id/notes/:noteID', authenticateToken, noteController.deleteNote);

module.exports = router;

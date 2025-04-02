const express = require('express');
const noteController = require('../controllers/noteController');

const router = express.Router();

// Create a new note in a study group
router.post('/groups/:id/notes', noteController.createNote);

// Get all notes in a study group
router.get('/groups/:id/notes', noteController.getAllNotes);

// Get a single note by ID
router.get('/groups/:id/notes/:noteID', noteController.getNoteById);

// Update a given note
router.put('/groups/:id/notes/:noteID', noteController.updateNote);

// Delete a note
router.delete('/groups/:id/notes/:noteID', noteController.deleteNote);

module.exports = router;

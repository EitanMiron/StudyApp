const Note = require('../models/noteModel');

// Create a new note in a study group
const createNote = async (req, res) => {
    const { term, definition, flashcards, collaborators, createdBy } = req.body;

    try {
        const newNote = new Note({
            term,
            definition,
            flashcards,
            collaborators,
            createdBy,
        });

        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all notes in a study group
const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ groupId: req.params.id }).populate('createdBy', 'name email');
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single note by ID
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteID).populate('createdBy', 'name email');
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a given note
const updateNote = async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(req.params.noteID, req.body, { new: true, runValidators: true });
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.noteID);
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createNote, getAllNotes, getNoteById, updateNote, deleteNote };

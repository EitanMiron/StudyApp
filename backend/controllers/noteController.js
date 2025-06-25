const Note = require('../models/noteModel');

// Personal Notes Controllers
const createPersonalNote = async (req, res) => {
    const { term, definition, flashcards, folderId } = req.body;
    console.log('Received request body:', req.body);
    console.log('User from token:', req.user);
    
    try {
        if (!term || !definition) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                received: { term, definition }
            });
        }

        const newNote = new Note({
            term,
            definition,
            flashcards: flashcards || [],
            folderId: folderId || 'General',
            createdBy: req.user.id,
            collaborators: [{ 
                userId: req.user.id,
                role: 'admin',
                modifiedAt: new Date()
            }]
        });

        console.log('Creating new note:', newNote);
        await newNote.save();
        console.log('Note saved successfully');
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(400).json({ 
            error: error.message,
            details: error.errors // Include Mongoose validation errors if any
        });
    }
};

const getPersonalNotes = async (req, res) => {
    try {
        const notes = await Note.find({ 
            'collaborators.userId': req.user.id 
        }).populate('createdBy', 'name email');
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPersonalNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.noteID,
            'collaborators.userId': req.user.id
        }).populate('createdBy', 'name email');
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePersonalNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.noteID,
            'collaborators.userId': req.user.id
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Update note fields
        Object.assign(note, req.body);
        await note.save();
        
        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePersonalNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.noteID,
            'collaborators.userId': req.user.id
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        await note.deleteOne();
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Group Notes Controllers
const createNote = async (req, res) => {
    const { term, definition, flashcards, collaborators } = req.body;
    try {
        const newNote = new Note({
            term,
            definition,
            flashcards,
            collaborators: [
                { userId: req.user._id, role: 'admin' },
                ...(collaborators || [])
            ],
            createdBy: req.user._id,
        });

        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ groupId: req.params.id }).populate('createdBy', 'name email');
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

const updateNote = async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.noteID, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

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

module.exports = {
    // Personal Notes
    createPersonalNote,
    getPersonalNotes,
    getPersonalNoteById,
    updatePersonalNote,
    deletePersonalNote,
    // Group Notes
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
};

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

interface Flashcard {
    question: string;
    answer: string;
    addedAt: Date;
}

interface Collaborator {
    userId: string;
    role: 'admin' | 'editor';
    modifiedAt: Date;
}

interface Note {
    _id: string;
    term: string;
    definition: string;
    flashcards: Flashcard[];
    collaborators: Collaborator[];
    createdBy: string;
    createdAt: Date;
}

interface NoteDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (noteData: { title: string; content: string; folderId: string; }) => void;
    note: Note | null;
    title: string;
}

const NoteDialog: React.FC<NoteDialogProps> = ({ open, onClose, onSave, note, title }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        folderId: ''
    });

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.term,
                content: note.definition,
                folderId: '' // Removed reference to non-existent folderId property
            });
        } else {
            setFormData({
                title: '',
                content: '',
                folderId: ''
            });
        }
    }, [note]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: formData.title,
            content: formData.content,
            folderId: formData.folderId
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableEnforceFocus={false}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {title}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Content"
                        multiline
                        rows={6}
                        fullWidth
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Folder</InputLabel>
                        <Select
                            value={formData.folderId}
                            onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                            label="Folder"
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="1">School</MenuItem>
                            <MenuItem value="2">Work</MenuItem>
                            <MenuItem value="3">Personal</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {note ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default NoteDialog; 
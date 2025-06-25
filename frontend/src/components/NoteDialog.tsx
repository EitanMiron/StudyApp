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
    folderId?: string;
}

interface NoteDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (noteData: { title: string; content: string; folderId: string; }) => void;
    note: Note | null;
    title: string;
    folders: string[];
    defaultFolder?: string;
}

const NoteDialog: React.FC<NoteDialogProps> = ({ open, onClose, onSave, note, title, folders, defaultFolder }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        folderId: defaultFolder || ''
    });

    useEffect(() => {
        if (note) {
            setFormData({
                title: note.term,
                content: note.definition,
                folderId: note.folderId || defaultFolder || ''
            });
        } else {
            setFormData({
                title: '',
                content: '',
                folderId: defaultFolder || ''
            });
        }
    }, [note, defaultFolder]);

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
                            {folders.map(folder => (
                                <MenuItem key={folder} value={folder}>{folder}</MenuItem>
                            ))}
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
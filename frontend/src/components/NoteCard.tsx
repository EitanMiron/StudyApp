import React from 'react';
import { Card, CardContent, Typography, IconButton, CardActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Note {
  _id: string;
  term: string;
  definition: string;
    folderId?: string;
}

interface NoteCardProps {
    note: Note;
    onEdit: () => void;
    onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
    return (
        <Card className="note-card">
            <CardContent>
                <Typography variant="h6" component="h2">
                    {note.term}
                </Typography>
                <hr className="note-separator" />
                <Typography variant="body2" color="textSecondary">
                    {note.definition}
                </Typography>
                <hr className="note-separator" />
            </CardContent>
            <CardActions className="note-card-actions">
                <button className="button-86 edit-button" role="button" onClick={onEdit}>
          Edit
        </button>
                <button className="button-86 delete-button" role="button" onClick={() => onDelete(note._id)}>
          Delete
        </button>
            </CardActions>
        </Card>
  );
};

export default NoteCard;

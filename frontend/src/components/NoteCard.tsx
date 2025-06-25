import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, CardActions, Button, Box, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

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
    onSelect?: () => void;
    isSelected?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onSelect, isSelected = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 50; // Maximum characters to show before truncating
    const shouldTruncate = note.definition.length > maxLength;
    const displayText = isExpanded ? note.definition : note.definition.substring(0, maxLength) + (shouldTruncate ? '...' : '');

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect();
        }
    };

    return (
        <Card 
            className={`note-card ${isSelected ? 'selected' : ''}`}
            sx={{
                cursor: 'default',
                border: isSelected ? '2px solid #2A7B9B' : '1px solid #e0e0e0',
                backgroundColor: isSelected ? 'rgba(42, 123, 155, 0.05)' : 'white',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }
            }}
        >
            {/* Selection Circle */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(42, 123, 155, 0.3)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(42, 123, 155, 0.1)',
                        transform: 'scale(1.1)',
                    }
                }}
                onClick={handleSelect}
            >
                {isSelected ? (
                    <CheckCircleIcon 
                        sx={{ 
                            color: '#2A7B9B', 
                            fontSize: 20,
                            animation: 'fadeIn 0.2s ease-in'
                        }} 
                    />
                ) : (
                    <RadioButtonUncheckedIcon 
                        sx={{ 
                            color: '#2A7B9B', 
                            fontSize: 20 
                        }} 
                    />
                )}
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 3, overflow: 'visible' }}>
                <Typography variant="h6" component="h2" sx={{ mb: 1, pr: 3 }}>
                    {note.term}
                </Typography>
                <hr className="note-separator" />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                    <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                            flexGrow: 1,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflow: 'visible'
                        }}
                    >
                        {displayText}
                    </Typography>
                    {shouldTruncate && (
                        <Button
                            size="small"
                            onClick={handleToggleExpand}
                            sx={{ 
                                mt: 1, 
                                alignSelf: 'flex-start',
                                color: '#2A7B9B',
                                textTransform: 'none',
                                minWidth: 'auto',
                                p: 0.5,
                                zIndex: 2
                            }}
                            startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        >
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </Button>
                    )}
                </Box>
                <hr className="note-separator" />
            </CardContent>
            <CardActions className="note-card-actions" sx={{ mt: 'auto', zIndex: 2, overflow: 'visible' }}>
                <button 
                    className="button-86 edit-button" 
                    role="button" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    Edit
                </button>
                <button 
                    className="button-86 delete-button" 
                    role="button" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note._id);
                    }}
                >
                    Delete
                </button>
            </CardActions>
        </Card>
  );
};

export default NoteCard;

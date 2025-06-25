import React, { useState, useEffect } from 'react';
import { 
    Box, 
    TextField, 
    IconButton, 
    Paper, 
    Typography,
    CircularProgress,
    Button,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../contexts/AuthContext';
import aiService, { AIChatMessage, GeneratedNote, GeneratedFlashcard, ConceptExplanation } from '../services/aiService';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'chat' | 'note' | 'flashcards' | 'explanation';
    data?: any;
}

interface AIAssistantProps {
    initialQuestion?: string;
    selectedNoteId?: string;
    selectedNote?: {
        term: string;
        definition: string;
    };
    onSaveNote?: (note: any) => void;
    onSaveFlashcards?: (noteId: string, flashcards: any[]) => void;
    onUpdateNoteDefinition?: (noteId: string, newDefinition: string) => void;
    folders?: string[];
    defaultFolder?: string;
    onAddFolder?: (folderName: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ initialQuestion, selectedNoteId, selectedNote, onSaveNote, onSaveFlashcards, onUpdateNoteDefinition, folders = [], defaultFolder = '', onAddFolder }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState(initialQuestion || '');
    const [loading, setLoading] = useState(false);
    const [showNoteGenerator, setShowNoteGenerator] = useState(false);
    const [showFlashcardGenerator, setShowFlashcardGenerator] = useState(false);
    const [showConceptExplainer, setShowConceptExplainer] = useState(false);
    const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
    const [pendingReplacement, setPendingReplacement] = useState<{ explanation: string; includeKeyPoints: boolean } | null>(null);
    const { user } = useAuth();

    // Note generator state
    const [noteTopic, setNoteTopic] = useState('');
    const [noteSubject, setNoteSubject] = useState('general');
    const [noteComplexity, setNoteComplexity] = useState('intermediate');
    const [noteFolder, setNoteFolder] = useState(defaultFolder || (folders[0] || ''));
    const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Flashcard generator state
    const [flashcardCount, setFlashcardCount] = useState(5);

    // Concept explainer state
    const [conceptToExplain, setConceptToExplain] = useState('');
    const [explanationLevel, setExplanationLevel] = useState('intermediate');

    useEffect(() => {
        if (initialQuestion) {
            handleSend(initialQuestion);
        }
        setNoteFolder(defaultFolder || (folders[0] || ''));
    }, [initialQuestion, defaultFolder, folders]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            type: 'chat'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const chatMessages: AIChatMessage[] = messages
                .filter(m => m.type === 'chat')
                .map(m => ({ role: m.role, content: m.content }));

            const response = await aiService.chat({
                messages: [...chatMessages, { role: 'user', content: textToSend }],
                noteId: selectedNoteId,
                context: selectedNote ? {
                    notes: [selectedNote]
                } : undefined
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.message,
                type: 'chat'
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                type: 'chat'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNote = async () => {
        if (!noteTopic.trim()) return;

        setLoading(true);
        try {
            const generatedNote = await aiService.generateNote(noteTopic, noteSubject, noteComplexity);
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I've generated a comprehensive note for "${noteTopic}"`,
                type: 'note',
                data: generatedNote
            }]);
            
            setShowNoteGenerator(false);
            setNoteTopic('');
        } catch (error) {
            console.error('Error generating note:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error generating the note. Please try again.',
                type: 'chat'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!selectedNoteId) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Please select a note first to generate flashcards.',
                type: 'chat'
            }]);
            return;
        }

        setLoading(true);
        try {
            const result = await aiService.generateFlashcards(selectedNoteId, flashcardCount);
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I've generated ${result.flashcards.length} flashcards for your note`,
                type: 'flashcards',
                data: result.flashcards
            }]);
            
            setShowFlashcardGenerator(false);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error generating flashcards. Please try again.',
                type: 'chat'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleExplainConcept = async () => {
        if (!conceptToExplain.trim()) return;

        setLoading(true);
        try {
            const explanation = await aiService.explainConcept(conceptToExplain, undefined, explanationLevel);
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Here's my explanation of "${conceptToExplain}"`,
                type: 'explanation',
                data: explanation
            }]);
            
            setShowConceptExplainer(false);
            setConceptToExplain('');
        } catch (error) {
            console.error('Error explaining concept:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error explaining the concept. Please try again.',
                type: 'chat'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneratedNote = () => {
        const lastNoteMsg = messages.filter(m => m.type === 'note').slice(-1)[0];
        if (!noteFolder || !lastNoteMsg || !lastNoteMsg.data) return;
        if (onSaveNote) {
            onSaveNote({
                term: lastNoteMsg.data.term || noteTopic,
                definition: lastNoteMsg.data.definition || '',
                folderId: noteFolder
            });
        }
        setShowNoteGenerator(false);
        setNoteTopic('');
    };

    const handleSaveGeneratedFlashcards = (flashcards: any[]) => {
        if (onSaveFlashcards && selectedNoteId) {
            onSaveFlashcards(selectedNoteId, flashcards);
        }
    };

    const handleUpdateNoteDefinition = (explanation: string, includeKeyPoints: boolean = false) => {
        if (onUpdateNoteDefinition && selectedNoteId) {
            const finalExplanation = includeKeyPoints 
                ? explanation + '\n\nKey Points:\n' + (explanation as any).keyPoints?.join('\n• ') || ''
                : explanation;
            
            setPendingReplacement({ explanation: finalExplanation, includeKeyPoints });
            setShowReplaceConfirmation(true);
        }
    };

    const confirmReplaceDefinition = () => {
        if (pendingReplacement && onUpdateNoteDefinition && selectedNoteId) {
            onUpdateNoteDefinition(selectedNoteId, pendingReplacement.explanation);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `✅ Successfully updated the definition for "${selectedNote?.term}"!`,
                type: 'chat'
            }]);
            setShowReplaceConfirmation(false);
            setPendingReplacement(null);
        }
    };

    const handleAddFolderLocal = () => {
        if (newFolderName.trim() && onAddFolder) {
            onAddFolder(newFolderName.trim());
            setNoteFolder(newFolderName.trim());
            setNewFolderName('');
            setNewFolderDialogOpen(false);
        }
    };

    const renderMessage = (message: Message, index: number) => {
        if (message.type === 'note' && message.data) {
            const note = message.data as GeneratedNote;
            return (
                <Box key={index} sx={{ mb: 2 }}>
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            {note.term}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {note.definition}
                        </Typography>
                        
                        {note.keyPoints.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Key Points:</Typography>
                                {note.keyPoints.map((point, i) => (
                                    <Chip key={i} label={point} size="small" sx={{ mr: 1, mb: 1 }} />
                                ))}
                            </Box>
                        )}
                        
                        {note.examples.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Examples:</Typography>
                                {note.examples.map((example, i) => (
                                    <Typography key={i} variant="body2" sx={{ ml: 2, mb: 1 }}>
                                        • {example}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        
                        {note.relatedConcepts.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Related Concepts:</Typography>
                                {note.relatedConcepts.map((concept, i) => (
                                    <Chip key={i} label={concept} variant="outlined" size="small" sx={{ mr: 1, mb: 1 }} />
                                ))}
                            </Box>
                        )}
                        
                        {onSaveNote && (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSaveGeneratedNote()}
                                sx={{ mt: 1 }}
                            >
                                Save Note
                            </Button>
                        )}
                    </Paper>
                </Box>
            );
        }

        if (message.type === 'flashcards' && message.data) {
            const flashcards = message.data as GeneratedFlashcard[];
            return (
                <Box key={index} sx={{ mb: 2 }}>
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Generated Flashcards
                        </Typography>
                        {flashcards.map((flashcard, i) => (
                            <Accordion key={i} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1">Question {i + 1}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Q: {flashcard.question}
                                        </Typography>
                                        <Typography variant="body1">
                                            A: {flashcard.answer}
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        
                        {onSaveFlashcards && selectedNoteId && (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSaveGeneratedFlashcards(flashcards)}
                                sx={{ mt: 1 }}
                            >
                                Save Flashcards
                            </Button>
                        )}
                    </Paper>
                </Box>
            );
        }

        if (message.type === 'explanation' && message.data) {
            const explanation = message.data as ConceptExplanation;
            const canReplace = onUpdateNoteDefinition && selectedNoteId && selectedNote;
            
            // Debug logging
            console.log('Explanation message debug:', {
                onUpdateNoteDefinition: !!onUpdateNoteDefinition,
                selectedNoteId,
                selectedNote: !!selectedNote,
                canReplace
            });

            return (
                <Box key={index} sx={{ mb: 2 }}>
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Concept Explanation
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {explanation.explanation}
                        </Typography>
                        
                        {explanation.keyPoints.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Key Points:</Typography>
                                {explanation.keyPoints.map((point, i) => (
                                    <Typography key={i} variant="body2" sx={{ ml: 2, mb: 1 }}>
                                        • {point}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        
                        {explanation.examples.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Examples:</Typography>
                                {explanation.examples.map((example, i) => (
                                    <Typography key={i} variant="body2" sx={{ ml: 2, mb: 1 }}>
                                        • {example}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        
                        {explanation.analogies.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Analogies:</Typography>
                                {explanation.analogies.map((analogy, i) => (
                                    <Typography key={i} variant="body2" sx={{ ml: 2, mb: 1 }}>
                                        • {analogy}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        
                        {explanation.applications.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Applications:</Typography>
                                {explanation.applications.map((application, i) => (
                                    <Typography key={i} variant="body2" sx={{ ml: 2, mb: 1 }}>
                                        • {application}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        
                        {canReplace ? (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Replace current definition for "{selectedNote.term}"?
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleUpdateNoteDefinition(explanation.explanation, false)}
                                    sx={{ mr: 1 }}
                                    color="warning"
                                >
                                    Replace Definition
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleUpdateNoteDefinition(explanation.explanation, true)}
                                >
                                    Replace with Key Points
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    💡 Tip: Select a note first to replace its definition with this explanation.
                                </Typography>
                                {selectedNoteId && !selectedNote && (
                                    <Typography variant="caption" color="text.secondary">
                                        Note: A note is selected but details are missing. Try selecting the note again.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Box>
            );
        }

        // Regular chat message
        return (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 1
                        }}
                    >
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                maxWidth: '70%',
                                backgroundColor: message.role === 'user' ? '#2A7B9B' : '#f5f5f5',
                                color: message.role === 'user' ? 'white' : 'inherit'
                            }}
                        >
                            <Typography variant="body1">
                                {message.content}
                            </Typography>
                        </Paper>
                    </Box>
        );
    };

    return (
        <Box sx={{ 
            width: '100%', 
            maxWidth: 800, 
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* AI Tools Header */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => setShowNoteGenerator(true)}
                    disabled={loading}
                >
                    Generate Note
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => setShowFlashcardGenerator(true)}
                    disabled={loading || !selectedNoteId}
                >
                    Generate Flashcards
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => setShowConceptExplainer(true)}
                    disabled={loading}
                >
                    Explain Concept
                </Button>
            </Box>

            {/* Messages */}
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 2, 
                    mb: 2,
                    flexGrow: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: '400px'
                }}
            >
                {messages.length === 0 && (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        <SmartToyIcon sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6">AI Study Assistant</Typography>
                        <Typography variant="body2">
                            Ask me anything about your notes, or use the tools above to generate content!
                        </Typography>
                    </Box>
                )}
                
                {messages.map((message, index) => renderMessage(message, index))}
                
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
            </Paper>

            {/* Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={loading}
                    size="small"
                />
                <IconButton 
                    color="primary" 
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                >
                    <SendIcon />
                </IconButton>
            </Box>

            {/* Note Generator Dialog */}
            <Dialog open={showNoteGenerator} onClose={() => setShowNoteGenerator(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Generate AI Note</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Topic"
                        value={noteTopic}
                        onChange={(e) => setNoteTopic(e.target.value)}
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Subject</InputLabel>
                        <Select
                            value={noteSubject}
                            onChange={(e) => setNoteSubject(e.target.value)}
                            label="Subject"
                        >
                            <MenuItem value="general">General</MenuItem>
                            <MenuItem value="math">Mathematics</MenuItem>
                            <MenuItem value="science">Science</MenuItem>
                            <MenuItem value="history">History</MenuItem>
                            <MenuItem value="literature">Literature</MenuItem>
                            <MenuItem value="computer-science">Computer Science</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Complexity</InputLabel>
                        <Select
                            value={noteComplexity}
                            onChange={(e) => setNoteComplexity(e.target.value)}
                            label="Complexity"
                        >
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Folder</InputLabel>
                        <Select
                            value={noteFolder}
                            onChange={(e) => setNoteFolder(e.target.value)}
                            label="Folder"
                        >
                            {folders.map(folder => (
                                <MenuItem key={folder} value={folder}>{folder}</MenuItem>
                            ))}
                            <MenuItem value="__new__" onClick={() => setNewFolderDialogOpen(true)}>
                                + Create New Folder
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
                        <DialogTitle>Add New Folder</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Folder Name"
                                type="text"
                                fullWidth
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddFolderLocal} variant="contained" color="primary">Add</Button>
                        </DialogActions>
                    </Dialog>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNoteGenerator(false)}>Cancel</Button>
                    <Button onClick={handleGenerateNote} variant="contained" disabled={!noteTopic.trim()}>
                        Generate
                    </Button>
                    <Button onClick={handleSaveGeneratedNote} variant="contained" color="success" disabled={!noteFolder || !messages.some(m => m.type === 'note' && m.data)}>
                        Save Note
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Flashcard Generator Dialog */}
            <Dialog open={showFlashcardGenerator} onClose={() => setShowFlashcardGenerator(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Generate Flashcards</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Generate flashcards for the selected note: {selectedNote?.term}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Number of Flashcards"
                        type="number"
                        value={flashcardCount}
                        onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
                        margin="normal"
                        inputProps={{ min: 1, max: 10 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFlashcardGenerator(false)}>Cancel</Button>
                    <Button onClick={handleGenerateFlashcards} variant="contained">
                        Generate
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Concept Explainer Dialog */}
            <Dialog open={showConceptExplainer} onClose={() => setShowConceptExplainer(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Explain Concept</DialogTitle>
                <DialogContent>
                    {selectedNote && (
                        <Box sx={{ mb: 2, p: 1, backgroundColor: 'rgba(42, 123, 155, 0.1)', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Selected Note: {selectedNote.term}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Current definition: {selectedNote.definition.substring(0, 100)}...
                            </Typography>
                        </Box>
                    )}
                    <TextField
                        fullWidth
                        label="Concept to Explain"
                        value={conceptToExplain}
                        onChange={(e) => setConceptToExplain(e.target.value)}
                        margin="normal"
                        required
                        placeholder={selectedNote ? `Explain ${selectedNote.term} in more detail` : "Enter a concept to explain"}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Explanation Level</InputLabel>
                        <Select
                            value={explanationLevel}
                            onChange={(e) => setExplanationLevel(e.target.value)}
                            label="Explanation Level"
                        >
                            <MenuItem value="beginner">Beginner</MenuItem>
                            <MenuItem value="intermediate">Intermediate</MenuItem>
                            <MenuItem value="advanced">Advanced</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedNote && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            💡 Tip: You can replace the current definition with the AI explanation if you find it more helpful.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConceptExplainer(false)}>Cancel</Button>
                    <Button onClick={handleExplainConcept} variant="contained" disabled={!conceptToExplain.trim()}>
                        Explain
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Replace Definition Confirmation Dialog */}
            <Dialog open={showReplaceConfirmation} onClose={() => setShowReplaceConfirmation(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Definition Replacement</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Are you sure you want to replace the current definition for "{selectedNote?.term}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        This action cannot be undone. The new definition will replace the current one.
                    </Typography>
                    {pendingReplacement && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(87, 199, 133, 0.1)', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                New Definition Preview:
                            </Typography>
                            <Typography variant="body2">
                                {pendingReplacement.explanation.substring(0, 200)}...
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReplaceConfirmation(false)}>Cancel</Button>
                    <Button onClick={confirmReplaceDefinition} variant="contained" color="warning">
                        Replace Definition
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIAssistant; 
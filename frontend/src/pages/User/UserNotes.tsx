import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NoteCard from '../../components/NoteCard';
import { useDashboardData } from '../../hooks/useDashboardData';
import '../../styles/userNotes.css';
import FolderIcon from '@mui/icons-material/Folder';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import { Dialog, CircularProgress, Typography, Box, Button, TextField, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import AIAssistant from '../../components/AIAssistant';
import NoteDialog from '../../components/NoteDialog';
import CloseIcon from '@mui/icons-material/Close';

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

const UserNotes: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { fetchDashboardData } = useDashboardData();
    const [folders, setFolders] = useState<string[]>(['General', 'Math', 'Science', 'History']);
    const [selectedFolder, setSelectedFolder] = useState<string>('General');
    const [aiQuestions, setAiQuestions] = useState<Array<{ question: string; answer: string }>>([
        { question: "What is the main concept of this note?", answer: "" },
        { question: "Can you explain this in simpler terms?", answer: "" },
        { question: "What are the key points to remember?", answer: "" }
    ]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [showAIAssistant, setShowAIAssistant] = useState(false); 
    const [currentAiQuestion, setCurrentAiQuestion] = useState<string | null>(null); 

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/noteRoutes/user/notes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Fetched notes data:", response.data);
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleNoteCreated = async (newNoteData: { title: string; content: string; folderId: string; }) => {
        console.log("Attempting to create note on backend:", newNoteData);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:4000/api/noteRoutes/user/notes', {
                term: newNoteData.title,
                definition: newNoteData.content,
                folderId: newNoteData.folderId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const createdNote: Note = { 
                _id: response.data._id,
                term: response.data.term,
                definition: response.data.definition,
                flashcards: response.data.flashcards || [],
                collaborators: response.data.collaborators || [],
                createdBy: response.data.createdBy,
                createdAt: response.data.createdAt,
                folderId: response.data.folderId || '', 
            };
            setNotes(prevNotes => [...prevNotes, createdNote]);
            setIsCreating(false);
            await fetchDashboardData(); 
        } catch (error) {
            console.error('Error creating note:', error);
        }
    };

    const handleNoteUpdated = async (updatedNoteData: { title: string; content: string; folderId: string; }) => {
        console.log("Attempting to update note on backend:", updatedNoteData);
        if (!selectedNote) return; 
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:4000/api/noteRoutes/user/notes/${selectedNote._id}`, {
                term: updatedNoteData.title,
                definition: updatedNoteData.content,
                folderId: updatedNoteData.folderId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(prevNotes => 
                prevNotes.map(note => 
                    note._id === selectedNote._id 
                        ? { 
                              ...note, 
                              term: updatedNoteData.title, 
                              definition: updatedNoteData.content,
                              folderId: updatedNoteData.folderId
                          }
                        : note
                )
            );
            setIsCreating(false); 
            setSelectedNote(null); 
            await fetchDashboardData(); 
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleNoteDeleted = async (noteId: string) => {
        console.log("Attempting to delete note with ID:", noteId);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:4000/api/noteRoutes/user/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
            await fetchDashboardData(); 
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleFolderSelect = (folder: string) => {
        setSelectedFolder(folder);
    };

    const handleDownloadNote = (note: Note) => {
        const content = `${note.term}\n\n${note.definition}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.term}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleShareNote = (note: Note) => {
        console.log('Sharing note:', note);
    };

    const handleAiQuestionClick = (question: string) => {
        setShowAIAssistant(true);
        setCurrentAiQuestion(question);
    };

    const toggleAIAssistant = () => {
        setShowAIAssistant(prev => !prev);
    };

    return (
        <div className="user-notes-page">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="sidebar-section">
                    <h3>Folders</h3>
                    <ul className="folder-list">
                        {folders.map(folder => (
                            <li 
                                key={folder}
                                className={`folder-item ${selectedFolder === folder ? 'active' : ''}`}
                                onClick={() => handleFolderSelect(folder)}
                            >
                                <FolderIcon />
                                {folder}
                            </li>
                        ))}
                    </ul>
                    <button className="sidebar-action" style={{ marginTop: '1rem' }}>
                        <AddIcon />
                        New Folder
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="header-top">
                        <button 
                            className="back-button"
                            onClick={() => navigate('/user')}
                        >
                            ← Back to Dashboard
                        </button>
                        <h1>Notes & Flashcards</h1>
                    </div>
                    <button 
                        className="action-button"
                        onClick={() => setIsCreating(true)}
                    >
                        Create New Note
                    </button>
                </div>
                <div className="content-section">
                    {isLoading ? (
                        <div className="loading-state">
                            <CircularProgress />
                        </div>
                    ) : notes.length === 0 && !isCreating ? (
                        <div className="empty-state">
                            <p>No notes yet. Create your first note to get started!</p>
                            <button
                                className="action-button add-note-inline"
                                onClick={() => setIsCreating(true)}
                            >
                                <AddIcon />
                            </button>
                        </div>
                    ) : (
                        <div className="notes-grid">
                            {notes.map(note => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    onEdit={() => {
                                        setSelectedNote(note);
                                        setIsCreating(false); 
                                    }}
                                    onDelete={() => handleNoteDeleted(note._id)}
                                />
                            ))}
                            {!isCreating && (
                                <button 
                                    className="add-note-button"
                                    onClick={() => setIsCreating(true)}
                                >
                                    +
                                </button>
                            )}
                            {isCreating && (
                                <NoteDialog
                                    open={true}
                                    onClose={() => setIsCreating(false)}
                                    onSave={handleNoteCreated}
                                    title="Create New Note"
                                    note={null} 
                                />
                            )}
                            {selectedNote && !isCreating && (
                                <NoteDialog
                                    open={true}
                                    onClose={() => setSelectedNote(null)}
                                    onSave={handleNoteUpdated}
                                    title="Edit Note"
                                    note={selectedNote}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="sidebar right">
                <div className="sidebar-section">
                    <h3>Note Actions</h3>
                    {selectedNote && (
                        <>
                            <button 
                                className="sidebar-action"
                                onClick={() => handleDownloadNote(selectedNote)}
                            >
                                <DownloadIcon />
                                Download as TXT
                            </button>
                            <button 
                                className="sidebar-action"
                                onClick={() => handleShareNote(selectedNote)}
                            >
                                <ShareIcon />
                                Share Note
                            </button>
                        </>
                    )}
                </div>

                <div className="sidebar-section">
                    <h3>AI Study Assistant</h3>
                    <div className="ai-questions">
                        {aiQuestions.map((q, index) => (
                            <div key={index} className="ai-question" onClick={() => handleAiQuestionClick(q.question)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <SmartToyIcon />
                                    {q.question}
                                </div>
                                {q.answer && (
                                    <div className="ai-answer">
                                        {q.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Floating AI Assistant Button */}
            <div className="ai-assistant-fab-container">
                <button className="ai-assistant-fab" onClick={toggleAIAssistant}>
                    {showAIAssistant ? <CloseIcon /> : <SmartToyIcon />}
                </button>
            </div>

            {/* AI Assistant Speech Bubble (now using Dialog) */}
            {showAIAssistant && (
                <Dialog open={showAIAssistant} onClose={toggleAIAssistant} maxWidth="sm" fullWidth PaperProps={{
                    sx: {
                        position: 'fixed',
                        bottom: 90,
                        right: 20,
                        margin: 0,
                        width: 300,
                        height: 400,
                        backgroundImage: "url('/assets/speech-bubble.png')",
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundColor: 'transparent', 
                        boxShadow: 'none', 
                        overflow: 'hidden', 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '30px 15px 50px 15px', 
                        boxSizing: 'border-box',
                        '@media (max-width: 768px)': {
                            width: '80vw',
                            height: '50vh',
                            bottom: 80,
                            right: 10,
                            left: 10,
                            margin: '0 auto',
                        },
                    }
                }}>
                    <AIAssistant initialQuestion={currentAiQuestion || undefined} />
                </Dialog>
            )}
        </div>
    );
};

export default UserNotes;
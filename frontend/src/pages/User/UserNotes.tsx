import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NoteCard from '../../components/NoteCard';
import { useDashboardData } from '../../hooks/useDashboardData';
import "../../styles/userNotes.css";
import FolderIcon from '@mui/icons-material/Folder';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';

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

    const handleNoteCreated = async (newNote: Note) => {
        setNotes(prevNotes => [...prevNotes, newNote]);
        setIsCreating(false);
        await fetchDashboardData(); // Refresh dashboard data
    };

    const handleNoteUpdated = async (updatedNote: Note) => {
        setNotes(prevNotes => 
            prevNotes.map(note => 
                note._id === updatedNote._id ? updatedNote : note
            )
        );
        await fetchDashboardData(); // Refresh dashboard data
    };

    const handleNoteDeleted = async (noteId: string) => {
        setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
        await fetchDashboardData(); // Refresh dashboard data
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
        // Implement sharing functionality
        console.log('Sharing note:', note);
    };

    const handleAiQuestionClick = (question: string) => {
        setSelectedNote(notes.find(note => note.term === question) || null);
        // Here you would typically make an API call to get the AI-generated answer
        // For now, we'll just set a placeholder answer
        const updatedQuestions = aiQuestions.map(q => 
            q.question === question 
                ? { ...q, answer: "This is a placeholder answer. The actual AI integration will be implemented later." }
                : q
        );
        setAiQuestions(updatedQuestions);
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
                            Loading notes...
                        </div>
                    ) : notes.length === 0 && !isCreating ? (
                        <div className="empty-state">
                            <p>No notes yet. Create your first note to get started!</p>
                        </div>
                    ) : (
                    <div className="notes-grid">
                        {notes.map(note => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onNoteUpdated={handleNoteUpdated}
                                onNoteDeleted={handleNoteDeleted}
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
                            <NoteCard
                                onNoteCreated={handleNoteCreated}
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
        </div>
    );
};

export default UserNotes; 
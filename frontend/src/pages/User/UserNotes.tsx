import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NoteCard from '../../components/NoteCard';
import { useDashboardData } from '../../hooks/useDashboardData';
import "../../styles/userNotes.css";

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

    return (
        <div className="user-notes-page dashboard-container">
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
                        {isCreating && (
                            <NoteCard
                                onNoteCreated={handleNoteCreated}
                            />
                        )}
                    {notes.map(note => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onNoteUpdated={handleNoteUpdated}
                                onNoteDeleted={handleNoteDeleted}
                            />
                                ))}
                            </div>
                )}
            </div>
        </div>
    );
};

export default UserNotes; 
import React, { useState } from 'react';
import axios from 'axios';
import "./../styles/userNotes.css";

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

interface NoteCardProps {
  note?: Note;
  groupId?: string;
  onNoteCreated?: (note: Note) => void;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  groupId, 
  onNoteCreated, 
  onNoteUpdated, 
  onNoteDeleted 
}) => {
  const [isEditing, setIsEditing] = useState(!note);
  const [formData, setFormData] = useState({
    term: note?.term || '',
    definition: note?.definition || '',
    flashcards: note?.flashcards || []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Ensure we're sending the correct data structure
      const noteData = {
        term: formData.term.trim(),
        definition: formData.definition.trim(),
        flashcards: formData.flashcards
      };

      console.log('Submitting note with data:', noteData);
      console.log('Headers:', headers);

      if (note) {
        // Update existing note
        const endpoint = groupId 
          ? `http://localhost:4000/api/noteRoutes/groups/${groupId}/notes/${note._id}`
          : `http://localhost:4000/api/noteRoutes/user/notes/${note._id}`;
        const response = await axios.put(endpoint, noteData, { headers });
        console.log('Update response:', response.data);
        onNoteUpdated?.(response.data);
      } else {
        // Create new note
        const endpoint = groupId 
          ? `http://localhost:4000/api/noteRoutes/groups/${groupId}/notes`
          : 'http://localhost:4000/api/noteRoutes/user/notes';
        const response = await axios.post(endpoint, noteData, { headers });
        console.log('Create response:', response.data);
        onNoteCreated?.(response.data);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
      }
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const endpoint = groupId 
        ? `http://localhost:4000/api/noteRoutes/groups/${groupId}/notes/${note._id}`
        : `http://localhost:4000/api/noteRoutes/user/notes/${note._id}`;
      
      await axios.delete(endpoint, { headers });
      onNoteDeleted?.(note._id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="note-card">
        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="term">Term</label>
            <input
              type="text"
              id="term"
              name="term"
              value={formData.term}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="definition">Definition</label>
            <textarea
              id="definition"
              name="definition"
              value={formData.definition}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>
          <div className="note-card-actions">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="edit-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="action-button"
            >
              {note ? 'Update' : 'Create'} Note
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3>{note?.term}</h3>
      </div>
      <div className="note-card-content">
        <p>{note?.definition}</p>
        {note?.flashcards && note.flashcards.length > 0 && (
          <div className="flashcards-section">
            <h4>Flashcards</h4>
            <div className="flashcard-list">
              {note.flashcards.map((flashcard, index) => (
                <div key={index} className="flashcard-item">
                  <p className="flashcard-question">Q: {flashcard.question}</p>
                  <p className="flashcard-answer">A: {flashcard.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="note-card-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="edit-button"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="delete-button"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;

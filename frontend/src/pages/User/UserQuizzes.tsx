import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Typography, Button, TextField, MenuItem, CircularProgress, Select, FormControl, InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "../../styles/UserQuizzes.css";

interface Quiz {
    _id: string;
    title: string;
    description: string;
    questionCount: number;
    timeLimit: number;
    dueDate: string;
    createdBy: {
        name: string;
    };
    submissions?: Array<{
        status: 'in-progress' | 'completed' | 'graded';
        score?: number;
        submittedAt?: string;
    }>;
    groupId: string | { _id: string };
    maxAttempts: number;
}

interface Group {
    _id: string;
    name: string;
    description: string;
    members: Array<{
        userId: string;
        role: string;
        joinedAt: string;
    }>;
    createdBy: {
        name: string;
        email: string;
    };
    createdAt: string;
}

const UserQuizzes: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            console.log('Fetching groups with token:', token.substring(0, 10) + '...');
            const response = await axios.get('http://localhost:4000/api/userRoutes/groups', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Groups response:', response.data);
            if (Array.isArray(response.data)) {
                setGroups(response.data);
                setError(null);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Invalid response format from server');
            }
        } catch (error: any) {
            console.error('Error fetching groups:', error);
            console.error('Error details:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to fetch groups');
            if (error.response?.status === 401) {
                navigate('/login/user');
            }
        }
    };

    const fetchQuizzes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            const response = await axios.get('http://localhost:4000/api/userRoutes/quizzes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(response.data);
        } catch (error: any) {
            console.error('Error fetching quizzes:', error);
            setError(error.response?.data?.message || 'Failed to fetch quizzes');
            if (error.response?.status === 401) {
                navigate('/login/user');
            }
        } finally {
            setLoading(false);
        }
    };

    const getQuizStatus = (quiz: Quiz) => {
        if (!quiz.submissions || quiz.submissions.length === 0) {
            return 'not_started';
        }
        const latestSubmission = quiz.submissions[quiz.submissions.length - 1];
        return latestSubmission.status;
    };

    const getQuizScore = (quiz: Quiz) => {
        if (!quiz.submissions || quiz.submissions.length === 0) {
            return null;
        }
        const latestSubmission = quiz.submissions[quiz.submissions.length - 1];
        return latestSubmission.score;
    };

    const canRetakeQuiz = (quiz: Quiz) => {
        if (!quiz.submissions) return true;
        return quiz.submissions.length < quiz.maxAttempts;
    };

    const handleCreateQuiz = () => {
        if (!selectedGroup) {
            setError('Please select a group first');
            return;
        }
        navigate(`/groups/${selectedGroup}/quizzes/create`);
    };

    const handleDeleteClick = (quizId: string) => {
        setQuizToDelete(quizId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!quizToDelete) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            // Find the quiz to get its groupId
            const quiz = quizzes.find(q => q._id === quizToDelete);
            if (!quiz) {
                setError('Quiz not found');
                return;
            }

            const groupId = typeof quiz.groupId === 'string' ? quiz.groupId : quiz.groupId._id;

            await axios.delete(`http://localhost:4000/api/quizRoutes/groups/${groupId}/quizzes/${quizToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove the deleted quiz from the state
            setQuizzes(quizzes.filter(q => q._id !== quizToDelete));
            setDeleteDialogOpen(false);
            setQuizToDelete(null);
        } catch (error: any) {
            console.error('Error deleting quiz:', error);
            setError(error.response?.data?.message || 'Failed to delete quiz');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
    };

    const filteredQuizzes = quizzes
        .filter(quiz => {
            const matchesSearch = 
                quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const status = getQuizStatus(quiz);
            const matchesFilter = filter === 'all' || status === filter;
            
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    if (loading) {
        return (
            <div className="quiz-page-container">
                <div className="loading-container">
                    <CircularProgress />
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page-container">
            <div className="quizzes-container">
                <div className="quizzes-header">
                    <div className="header-top">
                        <div className="header-top-row">
                            <div className="title-section">
                                <Button
                                    className="back-button"
                                    onClick={() => navigate('/user')}
                                    startIcon={<ArrowBackIcon />}
                                >
                                    Back to Dashboard
                                </Button>
                                <Typography variant="h4" className="quizzes-title">
                                    Quizzes
                                </Typography>
                            </div>
                            <div className="create-quiz-section">
                                <FormControl className="group-select">
                                    <InputLabel>Select Group</InputLabel>
                                    <Select
                                        value={selectedGroup}
                                        onChange={(e) => setSelectedGroup(e.target.value)}
                                        label="Select Group"
                                        error={!!error}
                                    >
                                        {groups && groups.length > 0 ? (
                                            groups.map(group => (
                                                <MenuItem key={group._id} value={group._id}>
                                                    {group.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No groups available</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                <Button 
                                    variant="contained" 
                                    className="create-quiz-button"
                                    onClick={handleCreateQuiz}
                                    startIcon={<AddIcon />}
                                    disabled={!selectedGroup}
                                >
                                    Create Quiz
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="quiz-filters">
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search quizzes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon />
                                ),
                            }}
                        />
                        <TextField
                            select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                            variant="outlined"
                        >
                            <MenuItem value="all">All Quizzes</MenuItem>
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </TextField>
                    </div>
                </div>

                {error && (
                    <Typography color="error" className="error-message">
                        {error}
                    </Typography>
                )}

                {filteredQuizzes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <Typography variant="h6">
                            {searchTerm ? 'No quizzes match your search' : 'No quizzes available'}
                        </Typography>
                    </div>
                ) : (
                    <div className="quiz-list">
                        {filteredQuizzes.map(quiz => {
                            const status = getQuizStatus(quiz);
                            const score = getQuizScore(quiz);
                            
                            return (
                                <div key={quiz._id} className="quiz-card">
                                    <div className="quiz-card-content">
                                        <div className="quiz-header">
                                            <Typography variant="h6">{quiz.title}</Typography>
                                            <IconButton
                                                onClick={() => handleDeleteClick(quiz._id)}
                                                className="delete-button"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </div>
                                        <Typography variant="body2" color="textSecondary">
                                            {quiz.description}
                                        </Typography>
                                        <div className="quiz-details">
                                            <Typography variant="body2">
                                                Questions: {quiz.questionCount}
                                            </Typography>
                                            {quiz.timeLimit && (
                                                <Typography variant="body2">
                                                    Time Limit: {quiz.timeLimit} minutes
                                                </Typography>
                                            )}
                                        </div>
                                        <div className="quiz-status">
                                            <Typography variant="body2">
                                                Status: {status}
                                            </Typography>
                                            {score !== null && (
                                                <Typography variant="body2">
                                                    Score: {score}%
                                                </Typography>
                                            )}
                                        </div>
                                        <div className="quiz-actions">
                                            {status === 'not_started' && (
                                                <Button 
                                                    variant="contained" 
                                                    className="quiz-button start-button"
                                                    onClick={() => {
                                                        const groupIdStr = typeof quiz.groupId === 'object' && quiz.groupId !== null 
                                                            ? quiz.groupId._id 
                                                            : String(quiz.groupId);
                                                        navigate(`/groups/${groupIdStr}/quizzes/${quiz._id}`);
                                                    }}
                                                >
                                                    Start Quiz
                                                </Button>
                                            )}
                                            {status === 'in-progress' && (
                                                <Button 
                                                    variant="contained" 
                                                    className="quiz-button start-button"
                                                    onClick={() => {
                                                        const groupIdStr = typeof quiz.groupId === 'object' && quiz.groupId !== null 
                                                            ? quiz.groupId._id 
                                                            : String(quiz.groupId);
                                                        navigate(`/groups/${groupIdStr}/quizzes/${quiz._id}`);
                                                    }}
                                                >
                                                    Continue Quiz
                                                </Button>
                                            )}
                                            {status === 'completed' && (
                                                <>
                                                    <Button 
                                                        variant="outlined" 
                                                        className="quiz-button edit-button"
                                                        onClick={() => {
                                                            const groupIdStr = typeof quiz.groupId === 'object' && quiz.groupId !== null 
                                                                ? quiz.groupId._id 
                                                                : String(quiz.groupId);
                                                            navigate(`/groups/${groupIdStr}/quizzes/${quiz._id}/results`);
                                                        }}
                                                    >
                                                        View Results {score !== null && `(${score}%)`}
                                                    </Button>
                                                    {canRetakeQuiz(quiz) && (
                                                        <Button 
                                                            variant="contained" 
                                                            className="quiz-button retake-button"
                                                            onClick={() => {
                                                                const groupIdStr = typeof quiz.groupId === 'object' && quiz.groupId !== null 
                                                                    ? quiz.groupId._id 
                                                                    : String(quiz.groupId);
                                                                navigate(`/groups/${groupIdStr}/quizzes/${quiz._id}`);
                                                            }}
                                                        >
                                                            Retake Quiz
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleDeleteCancel}
                >
                    <DialogTitle>Delete Quiz</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this quiz? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default UserQuizzes; 
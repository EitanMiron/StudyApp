import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Paper,
    CircularProgress,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/UserQuizzes.css';

interface Question {
    _id: string;
    questionText: string;
    options: Array<{
        _id: string;
        optionText: string;
        isCorrect: boolean;
    }>;
    userAnswer?: string;
    isCorrect?: boolean;
}

interface QuizResult {
    _id: string;
    quiz: {
        _id: string;
        title: string;
        description: string;
        questions: Question[];
    };
    score: number;
    totalQuestions: number;
    completedAt: string;
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: Array<{
        _id: string;
        questionText: string;
        options: Array<{
            _id: string;
            optionText: string;
            isCorrect: boolean;
        }>;
    }>;
    submissions: Array<{
        status: 'completed';
        score: number;
        submittedAt: string;
    }>;
    maxAttempts: number;
    groupId: string | { _id: string };
}

const QuizResults: React.FC = () => {
    const navigate = useNavigate();
    const { groupId, quizId } = useParams<{ groupId: string; quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuizResults = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login/user');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:4000/api/quizRoutes/groups/${groupId}/quizzes/${quizId}/results`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setQuiz(response.data);
            } catch (error: any) {
                console.error('Error fetching quiz results:', error);
                setError(error.response?.data?.message || 'Failed to fetch quiz results');
            } finally {
                setLoading(false);
            }
        };

        fetchQuizResults();
    }, [groupId, quizId, navigate]);

    if (loading) {
        return (
            <div className="loading-container">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <Typography color="error">{error}</Typography>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="error-container">
                <Typography color="error">Quiz not found</Typography>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="quiz-results-container">
            <div className="quiz-header">
                <div className="header-top">
                    <div className="header-top-row">
                        <div className="title-section">
                            <Button
                                className="back-button"
                                onClick={() => navigate('/quizzes')}
                                startIcon={<ArrowBackIcon />}
                            >
                                Back to Quizzes
                            </Button>
                            <Typography variant="h4" className="quiz-title">
                                {quiz.title} - Results
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>

            <Paper className="results-section">
                <Typography variant="h6" gutterBottom>
                    Quiz Attempts
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Attempt</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell>Submitted At</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quiz.submissions.map((submission, index) => (
                                <TableRow key={index}>
                                    <TableCell>Attempt {index + 1}</TableCell>
                                    <TableCell>{submission.score}%</TableCell>
                                    <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Paper className="results-section">
                <Typography variant="h6" gutterBottom>
                    Quiz Details
                </Typography>
                <Typography variant="body1" paragraph>
                    {quiz.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Total Questions: {quiz.questions.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Maximum Attempts: {quiz.maxAttempts}
                </Typography>
            </Paper>

            <div className="action-buttons">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        const groupIdStr = typeof quiz.groupId === 'object' && quiz.groupId !== null 
                            ? quiz.groupId._id 
                            : String(quiz.groupId);
                        navigate(`/groups/${groupIdStr}/quizzes/${quiz._id}`);
                    }}
                    disabled={quiz.submissions.length >= quiz.maxAttempts}
                >
                    {quiz.submissions.length >= quiz.maxAttempts ? 'Maximum Attempts Reached' : 'Retake Quiz'}
                </Button>
            </div>
        </div>
    );
};

export default QuizResults; 
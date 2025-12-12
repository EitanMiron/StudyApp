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
import '../../styles/QuizTaking.css';

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

interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    submissions: Array<{
        status: 'completed';
        score: number;
        submittedAt: string;
        answers: Array<{
            questionId: string;
            selectedOption: string;
            isCorrect: boolean;
        }>;
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
                    `/api/quizRoutes/groups/${groupId}/quizzes/${quizId}/results`,
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
            <div className="quiz-page">
                <div className="quiz-page-container">
            <div className="loading-container">
                <CircularProgress />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-page">
                <div className="quiz-page-container">
            <div className="error-container">
                <Typography color="error">{error}</Typography>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="quiz-page">
                <div className="quiz-page-container">
            <div className="error-container">
                <Typography color="error">Quiz not found</Typography>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Sort submissions by submission date (newest first)
    const sortedSubmissions = [...quiz.submissions].sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    const latestSubmission = sortedSubmissions[0];
    
    // Calculate correct answers using the latest submission's answers
    const correctAnswers = latestSubmission ? quiz.questions.reduce((count, question, index) => {
        const submissionAnswer = latestSubmission.answers.find(a => a.questionId === question._id);
        const isCorrect = submissionAnswer?.isCorrect || false;
        console.log('Question:', {
            questionText: question.questionText,
            userAnswer: submissionAnswer?.selectedOption,
            correctOptionId: question.options.find(opt => opt.isCorrect)?._id,
            isCorrect,
            options: question.options,
            submissionAnswer
        });
        return isCorrect ? count + 1 : count;
    }, 0) : 0;
    
    const totalQuestions = quiz.questions.length;
    const score = latestSubmission ? latestSubmission.score : 0;

    console.log('Quiz Results:', {
        totalQuestions,
        correctAnswers,
        score,
        latestSubmission: {
            ...latestSubmission,
            answers: latestSubmission?.answers
        },
        questions: quiz.questions.map((q, index) => ({
            text: q.questionText,
            userAnswer: latestSubmission?.answers[index],
            correctOption: q.options.find(opt => opt.isCorrect)?._id,
            options: q.options
        }))
    });

    return (
        <div className="quiz-page">
            <div className="quiz-page-container">
                <div className="results-container">
                    <div className="results-header">
                <div className="header-top">
                    <div className="header-top-row">
                            <Button
                                className="back-button"
                                onClick={() => navigate('/quizzes')}
                                startIcon={<ArrowBackIcon />}
                            >
                                Back to Quizzes
                            </Button>
                                <div className="title-section">
                            <Typography variant="h4" className="quiz-title">
                                {quiz.title} - Results
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>

                    <div className="results-summary">
                        <div className="summary-item">
                            <Typography className="summary-label">Score</Typography>
                            <Typography className="summary-value">{score}%</Typography>
                        </div>
                        <div className="summary-item">
                            <Typography className="summary-label">Correct Answers</Typography>
                            <Typography className="summary-value">{correctAnswers}/{totalQuestions}</Typography>
                        </div>
                        <div className="summary-item">
                            <Typography className="summary-label">Attempts</Typography>
                            <Typography className="summary-value">{quiz.submissions.length}/{quiz.maxAttempts}</Typography>
                        </div>
                    </div>

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

                    <Paper className="results-section">
                        <Typography variant="h6" gutterBottom>
                            Attempt History
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
                                    {sortedSubmissions.map((submission, index) => (
                                        <TableRow key={index}>
                                            <TableCell>Attempt {quiz.submissions.length - index}</TableCell>
                                            <TableCell>{submission.score}%</TableCell>
                                            <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    <div className="results-actions">
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
            </div>
        </div>
    );
};

export default QuizResults; 

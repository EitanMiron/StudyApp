import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Paper,
    CircularProgress,
    Box,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    TextField,
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
}

interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    timeLimit: number;
    maxAttempts: number;
    submissions?: Array<{
        status: 'in-progress' | 'completed';
        score?: number;
        submittedAt?: string;
    }>;
    groupId: string | { _id: string };
}

const TakeQuiz: React.FC = () => {
    const navigate = useNavigate();
    const { groupId, quizId } = useParams<{ groupId: string; quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [currentAttempt, setCurrentAttempt] = useState(1);

    useEffect(() => {
    const fetchQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

                const response = await axios.get(
                    `/api/quizRoutes/groups/${groupId}/quizzes/${quizId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

            setQuiz(response.data);
                if (response.data.submissions && response.data.submissions.length > 0) {
                    setCurrentAttempt(response.data.submissions.length + 1);
                }
                setTimeLeft(response.data.timeLimit * 60);

                // Initialize answers
                const initialAnswers: { [key: string]: string } = {};
                response.data.questions.forEach((question: Question) => {
                    initialAnswers[question._id] = '';
                });
                setAnswers(initialAnswers);
        } catch (error: any) {
            console.error('Error fetching quiz:', error);
            setError(error.response?.data?.message || 'Failed to fetch quiz');
            if (error.response?.status === 401) {
                navigate('/login/user');
            }
        } finally {
            setLoading(false);
        }
    };

        fetchQuiz();
    }, [groupId, quizId, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            // Validate all questions are answered
            const unansweredQuestions = quiz.questions.filter(
                question => !answers[question._id]
            );

            if (unansweredQuestions.length > 0) {
                setError('Please answer all questions before submitting');
                return;
            }

            const groupIdStr = typeof quiz.groupId === 'object' && quiz.groupId !== null 
                ? quiz.groupId._id 
                : String(quiz.groupId);

            // Convert answers object to array in the correct order
            const answersArray = quiz.questions.map(question => answers[question._id]);

            await axios.post(
                `/api/quizRoutes/groups/${groupIdStr}/quizzes/${quizId}/submit`,
                {
                    answers: answersArray,
                    attemptNumber: currentAttempt
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/groups/${groupIdStr}/quizzes/${quizId}/results`);
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            setError(error.response?.data?.message || 'Failed to submit quiz');
        }
    };

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

    const progress = Object.values(answers).filter(answer => answer !== '').length / quiz.questions.length * 100;

    return (
        <div className="quiz-page">
            <div className="quiz-page-container">
                <div className="quiz-taking-container">
                    <div className="quiz-header">
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
                                {quiz.title}
                            </Typography>
                        </div>
                                <div className={`timer ${timeLeft <= 300 ? 'warning' : ''}`}>
                            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                    </div>
                </div>
            </div>

            {error && (
                <Typography color="error" className="error-message">
                    {error}
                </Typography>
            )}

                    <div className="quiz-progress">
                        <Typography variant="body2" color="textSecondary">
                            Progress: {Object.values(answers).filter(answer => answer !== '').length} of {quiz.questions.length} questions answered
                        </Typography>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <Paper className="quiz-form-section">
                            <Typography variant="body1" className="quiz-description">
                        {quiz.description}
                    </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {quiz.questions.length} questions
                                {quiz.timeLimit && ` • ${quiz.timeLimit} minutes time limit`}
                                {` • Attempt ${currentAttempt} of ${quiz.maxAttempts}`}
                            </Typography>
                </Paper>

                {quiz.questions.map((question, index) => (
                            <Paper key={question._id} className="question-container">
                                <Typography variant="h6" className="question-text">
                                    Question {index + 1}: {question.questionText}
                        </Typography>
                                <FormControl component="fieldset" className="options-container">
                            <RadioGroup
                                value={answers[question._id] || ''}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            >
                                {question.options.map((option) => (
                                    <FormControlLabel
                                        key={option._id}
                                        value={option._id}
                                        control={<Radio />}
                                        label={option.optionText}
                                                className="option-label"
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                ))}

                        <div className="quiz-actions">
                    <Button
                        variant="contained"
                        color="primary"
                                type="submit"
                                disabled={Object.keys(answers).length === 0}
                    >
                        Submit Quiz
                    </Button>
                        </div>
            </form>
                </div>
            </div>
        </div>
    );
};

export default TakeQuiz; 

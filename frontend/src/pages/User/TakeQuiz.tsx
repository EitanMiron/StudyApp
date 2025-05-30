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
import '../../styles/UserQuizzes.css';

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
    timeLimit: number;
    questions: Question[];
    groupId: string;
}

const TakeQuiz: React.FC = () => {
    const navigate = useNavigate();
    const { quizId, groupId } = useParams<{ quizId: string; groupId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (quizId && groupId) {
            fetchQuiz();
        }
    }, [quizId, groupId]);

    useEffect(() => {
        if (quiz?.timeLimit) {
            setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [quiz]);

    const fetchQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            // Ensure groupId is a string
            const groupIdStr = typeof groupId === 'object' && groupId !== null && '_id' in groupId 
                ? (groupId as { _id: string })._id 
                : String(groupId);

            const response = await axios.get(`http://localhost:4000/api/quizRoutes/groups/${groupIdStr}/quizzes/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuiz(response.data);
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

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            // Ensure groupId is a string
            const groupIdStr = typeof groupId === 'object' && groupId !== null && '_id' in groupId 
                ? (groupId as { _id: string })._id 
                : String(groupId);

            // Convert answers object to array of strings
            const answersArray = quiz?.questions.map(question => answers[question._id] || '') || [];

            await axios.post(
                `http://localhost:4000/api/quizRoutes/groups/${groupIdStr}/quizzes/${quizId}/submit`,
                { answers: answersArray },
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
            <div className="loading-container">
                <CircularProgress />
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

    return (
        <div className="quizzes-container">
            <div className="quizzes-header">
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
                            <Typography variant="h4" className="quizzes-title">
                                {quiz.title}
                            </Typography>
                        </div>
                        <Typography variant="h6" className="time-left">
                            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </Typography>
                    </div>
                </div>
            </div>

            {error && (
                <Typography color="error" className="error-message">
                    {error}
                </Typography>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="quiz-form">
                <Paper className="quiz-form-section">
                    <Typography variant="body1" gutterBottom>
                        {quiz.description}
                    </Typography>
                </Paper>

                {quiz.questions.map((question, index) => (
                    <Paper key={question._id} className="question-card">
                        <Typography variant="h6" gutterBottom>
                            Question {index + 1}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {question.questionText}
                        </Typography>

                        <FormControl component="fieldset" className="answer-options">
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
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                ))}

                <Box className="form-actions">
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className="submit-button"
                    >
                        Submit Quiz
                    </Button>
                </Box>
            </form>
        </div>
    );
};

export default TakeQuiz; 
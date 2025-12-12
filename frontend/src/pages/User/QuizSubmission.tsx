import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    Paper,
    CircularProgress,
    Box,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/UserQuizzes.css';

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
    timeLimit: number;
    maxAttempts: number;
    submissions?: Array<{
        status: 'in-progress' | 'completed';
        score?: number;
        submittedAt?: string;
    }>;
    groupId: string | { _id: string };
}

const QuizSubmission: React.FC = () => {
    const navigate = useNavigate();
    const { groupId, quizId } = useParams<{ groupId: string; quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAttempt, setCurrentAttempt] = useState(1);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login/user');
                    return;
                }

                // Ensure groupId is a string
                const groupIdStr = groupId;

                const response = await axios.get(
                    `/api/quizRoutes/groups/${groupIdStr}/quizzes/${quizId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setQuiz(response.data);
                if (response.data.submissions && response.data.submissions.length > 0) {
                    setCurrentAttempt(response.data.submissions.length + 1);
                }

                // Initialize answers
                const initialAnswers: { [key: string]: string } = {};
                response.data.questions.forEach((question: any) => {
                    initialAnswers[question._id] = '';
                });
                setAnswers(initialAnswers);

                // Set time limit if exists
                if (response.data.timeLimit) {
                    setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
                }
            } catch (error: any) {
                console.error('Error fetching quiz:', error);
                setError(error.response?.data?.message || 'Failed to fetch quiz');
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [groupId, quizId, navigate]);

    const handleSubmit = async () => {
        if (!quiz) return;

        try {
            setIsSubmitting(true);
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
                setIsSubmitting(false);
                return;
            }

            // Ensure groupId is a string
            const groupIdStr = groupId;

            const response = await axios.post(
                `/api/quizRoutes/groups/${groupIdStr}/quizzes/${quizId}/submit`,
                {
                    answers,
                    attemptNumber: currentAttempt
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/groups/${groupIdStr}/quizzes/${quizId}/results`);
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            setError(error.response?.data?.message || 'Failed to submit quiz');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="quiz-submission-container">
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
                                {quiz?.title}
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <Typography color="error" className="error-message">
                    {error}
                </Typography>
            )}

            {loading ? (
                <div className="loading-container">
                    <CircularProgress />
                </div>
            ) : quiz ? (
                <>
                    <Paper className="quiz-info">
                        <Typography variant="body1">
                            {quiz.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {quiz.questions.length} questions
                            {quiz.timeLimit && ` • ${quiz.timeLimit} minutes time limit`}
                            {` • Attempt ${currentAttempt} of ${quiz.maxAttempts}`}
                        </Typography>
                    </Paper>

                    <div className="questions-container">
                        {quiz.questions.map((question, index) => (
                            <Paper key={question._id} className="question-card">
                                <Typography variant="h6" gutterBottom>
                                    Question {index + 1}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {question.questionText}
                                </Typography>
                                <RadioGroup
                                    value={answers[question._id] || ''}
                                    onChange={(e) => setAnswers(prev => ({
                                        ...prev,
                                        [question._id]: e.target.value
                                    }))}
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
                            </Paper>
                        ))}
                    </div>

                    <Box className="submit-section">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="body1" color="error">
                    Quiz not found
                </Typography>
            )}
        </div>
    );
}; 

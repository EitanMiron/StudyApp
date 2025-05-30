import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    Button,
    TextField,
    Paper,
    IconButton,
    MenuItem,
    CircularProgress,
    Box,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import '../../styles/UserQuizzes.css';

interface Question {
    questionText: string;
    options: Array<{
        optionText: string;
        isCorrect: boolean;
    }>;
}

interface QuizData {
    title: string;
    description: string;
    timeLimit: string;
    maxAttempts: number;
    questions: Question[];
}

const CreateQuiz: React.FC = () => {
    const navigate = useNavigate();
    const { groupId } = useParams<{ groupId: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quizData, setQuizData] = useState<QuizData>({
        title: '',
        description: '',
        timeLimit: '',
        maxAttempts: 1,
        questions: [
            {
                questionText: '',
                options: [
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false }
                ]
            }
        ]
    });

    useEffect(() => {
        if (!groupId) {
            setError('No group selected. Please select a group first.');
        }
    }, [groupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }

            if (!groupId) {
                throw new Error('No group selected. Please select a group first.');
            }

            // Validate quiz data
            if (!quizData.title || !quizData.description || quizData.questions.length === 0) {
                throw new Error('Please fill in all required fields');
            }

            // Validate questions
            for (const question of quizData.questions) {
                if (!question.questionText || !question.options.some(option => option.isCorrect)) {
                    throw new Error('Please fill in all question fields and ensure at least one correct answer');
                }
            }

            // Validate at least one correct answer per question
            const hasValidQuestions = quizData.questions.every(question => 
                question.options.some(option => option.isCorrect)
            );

            if (!hasValidQuestions) {
                setError('Each question must have at least one correct answer');
                return;
            }

            const response = await axios.post(
                `http://localhost:4000/api/quizRoutes/groups/${groupId}/quizzes`,
                {
                    ...quizData,
                    timeLimit: quizData.timeLimit ? parseInt(quizData.timeLimit) : null,
                    maxAttempts: quizData.maxAttempts
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/quizzes');
        } catch (error: any) {
            console.error('Error creating quiz:', error);
            console.error('Error response:', error.response?.data); // Log the full error response
            setError(error.response?.data?.message || error.message || 'Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    questionText: '',
                    options: [
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false },
                        { optionText: '', isCorrect: false }
                    ]
                }
            ]
        }));
    };

    const removeQuestion = (index: number) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index: number, field: keyof Question, value: string) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => 
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const updateOption = (questionIndex: number, optionIndex: number, field: 'optionText' | 'isCorrect', value: string | boolean) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => 
                i === questionIndex ? {
                    ...q,
                    options: q.options.map((opt, j) => 
                        j === optionIndex ? { ...opt, [field]: value } : opt
                    )
                } : q
            )
        }));
    };

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
                                Create New Quiz
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

            <form onSubmit={handleSubmit} className="quiz-form">
                <Paper className="quiz-form-section">
                    <Typography variant="h6" gutterBottom>
                        Quiz Details
                    </Typography>
                    <TextField
                        fullWidth
                        label="Title"
                        value={quizData.title}
                        onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={quizData.description}
                        onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                        required
                        multiline
                        rows={3}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Time Limit (minutes)"
                        type="number"
                        value={quizData.timeLimit}
                        onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: e.target.value }))}
                        margin="normal"
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Maximum Attempts"
                        type="number"
                        value={quizData.maxAttempts}
                        onChange={(e) => setQuizData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                        margin="normal"
                        inputProps={{ min: 1 }}
                        required
                    />
                </Paper>

                <Paper className="quiz-form-section">
                    <div className="section-header">
                        <Typography variant="h6">
                            Questions
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={addQuestion}
                        >
                            Add Question
                        </Button>
                    </div>

                    {quizData.questions.map((question, questionIndex) => (
                        <Paper key={questionIndex} className="question-card">
                            <div className="question-header">
                                <Typography variant="subtitle1">
                                    Question {questionIndex + 1}
                                </Typography>
                                <IconButton
                                    onClick={() => removeQuestion(questionIndex)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>

                            <TextField
                                fullWidth
                                label="Question Text"
                                value={question.questionText}
                                onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                                required
                                margin="normal"
                            />

                            {question.options.map((option, optionIndex) => (
                                <Box key={optionIndex} className="option-row">
                                    <TextField
                                        fullWidth
                                        label={`Option ${optionIndex + 1}`}
                                        value={option.optionText}
                                        onChange={(e) => updateOption(questionIndex, optionIndex, 'optionText', e.target.value)}
                                        required
                                        margin="normal"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={option.isCorrect}
                                                onChange={(e) => updateOption(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                            />
                                        }
                                        label="Correct Answer"
                                    />
                                </Box>
                            ))}
                        </Paper>
                    ))}
                </Paper>

                <Box className="form-actions">
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Quiz'}
                    </Button>
                </Box>
            </form>
        </div>
    );
};

export default CreateQuiz; 
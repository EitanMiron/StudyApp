import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/Dashboard.css";

interface Quiz {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    timeLimit: number;
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
}

const UserQuizzes: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/userRoutes/quizzes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuizzes(response.data);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login/user');
                }
            }
        };

        fetchQuizzes();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Quizzes</h1>
            </div>
            <div className="content-section">
                <div className="quizzes-grid">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="quiz-card">
                            <h3>{quiz.title}</h3>
                            <p>{quiz.description}</p>
                            <div className="quiz-details">
                                <span>Questions: {quiz.questionCount}</span>
                                <span>Time Limit: {quiz.timeLimit} minutes</span>
                            </div>
                            <div className="quiz-status">
                                <span className={`status ${quiz.status}`}>
                                    {quiz.status.replace('_', ' ')}
                                </span>
                                {quiz.score !== undefined && (
                                    <span className="score">Score: {quiz.score}%</span>
                                )}
                            </div>
                            <div className="quiz-actions">
                                {quiz.status === 'not_started' && (
                                    <button className="action-button">Start Quiz</button>
                                )}
                                {quiz.status === 'in_progress' && (
                                    <button className="action-button">Continue Quiz</button>
                                )}
                                {quiz.status === 'completed' && (
                                    <button className="action-button">Review Results</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserQuizzes; 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Dashboard.css";
import axios from 'axios';
// Add axios interceptor for authentication
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

interface DashboardStats {
    totalResources: number;
    enrolledGroups: number;
    completedQuizzes: number;
    totalNotes: number;
    upcomingDeadlines: Array<{
        id: string;
        title: string;
        type: string;
        dueDate: string;
    }>;
}

const UserDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        enrolledGroups: 0,
        completedQuizzes: 0,
        totalNotes: 0,
        totalResources: 0,
        upcomingDeadlines: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/user/dashboard');
                setStats(response.data);
            } catch (error: any) {
                console.error('Error fetching dashboard data:', error);
                if (error.response?.status === 401) {
                    // Clear invalid token and redirect to login
                    localStorage.removeItem('token');
                    navigate('/login/user');
                }
            }
        };

        fetchDashboardData();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1> Welcome to User Dashboard </h1>
                    {/* <p>Welcome back! Here's your study overview.</p> */}
                </div>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <h3>Enrolled Groups</h3>
                    <div className="value">{stats.enrolledGroups}</div>
                </div>
                <div className="stat-card">
                    <h3>Completed Quizzes</h3>
                    <div className="value">{stats.completedQuizzes}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Notes</h3>
                    <div className="value">{stats.totalNotes}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Resources</h3>
                    <div className="value">{stats.totalResources}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section user-section">
                    <h2>Study Groups</h2>
                    <p>Join or create study groups to collaborate with peers.</p>
                    <Link to="/groups" className="action-button">View Groups</Link>
                </div>

                <div className="dashboard-section user-section">
                    <h2>Notes & Flashcards</h2>
                    <p>Access and create study materials and flashcards.</p>
                    <Link to="/notes" className="action-button">View Notes</Link>
                </div>

                <div className="dashboard-section user-section">
                    <h2>Quizzes</h2>
                    <p>Take quizzes to test your knowledge and track progress.</p>
                    <Link to="/quizzes" className="action-button">Take a Quiz</Link>
                </div>

                <div className="dashboard-section user-section">
                    <h2>Resources</h2>
                    <p>Access study materials and learning resources.</p>
                    <Link to="/resources" className="action-button">View Resources</Link>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Upcoming Deadlines</h2>
                <ul className="activity-list">
                    {stats.upcomingDeadlines.map(deadline => (
                        <li key={deadline.id} className="activity-item">
                            <span>{deadline.title} ({deadline.type})</span>
                            <span>Due: {new Date(deadline.dueDate).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserDashboard;

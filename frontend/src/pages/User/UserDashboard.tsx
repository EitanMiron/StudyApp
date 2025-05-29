import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/Dashboard.css";
import { useDashboardData } from '../../hooks/useDashboardData';

const UserDashboard: React.FC = () => {
    const { stats } = useDashboardData();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome to User Dashboard</h1>
                </div>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>

            <div className="stats-overview">
                <div className="stat-card"><h3>Enrolled Groups</h3><div className="value">{stats.enrolledGroups}</div></div>
                <div className="stat-card"><h3>Completed Quizzes</h3><div className="value">{stats.completedQuizzes}</div></div>
                <div className="stat-card"><h3>Total Notes</h3><div className="value">{stats.totalNotes}</div></div>
                <div className="stat-card"><h3>Total Resources</h3><div className="value">{stats.totalResources}</div></div>
            </div>

            <div className="dashboard-sections">
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

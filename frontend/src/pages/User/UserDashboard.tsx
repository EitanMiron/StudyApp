import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/Dashboard.css";
import { useDashboardData } from '../../hooks/useDashboardData';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import NoteIcon from '@mui/icons-material/Note';
import QuizIcon from '@mui/icons-material/Quiz';
import BookIcon from '@mui/icons-material/Book';
import robotIcon from '../../assets/robot_12133562.png';

const UserDashboard: React.FC = () => {
    const { stats } = useDashboardData();
    const navigate = useNavigate();
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        navigate('/');
    };

    const toggleAiDialog = () => {
        setIsAiDialogOpen(!isAiDialogOpen);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome to Your Dashboard</h1>
                </div>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
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
                <div className="dashboard-section">
                    <h2>
                        <GroupsIcon />
                        Study Groups
                    </h2>
                    <p>Join or create study groups to collaborate with peers and enhance your learning experience.</p>
                    <Link to="/groups" className="action-button">View Groups</Link>
                </div>

                <div className="dashboard-section">
                    <h2>
                        <NoteIcon />
                        Notes & Flashcards
                    </h2>
                    <p>Create and manage your study materials, including notes and flashcards for effective learning.</p>
                    <Link to="/notes" className="action-button">View Notes</Link>
                </div>

                <div className="dashboard-section">
                    <h2>
                        <QuizIcon />
                        Quizzes
                    </h2>
                    <p>Test your knowledge with interactive quizzes and track your progress over time.</p>
                    <Link to="/quizzes" className="action-button">Take a Quiz</Link>
                </div>

                <div className="dashboard-section">
                    <h2>
                        <BookIcon />
                        Resources
                    </h2>
                    <p>Access a variety of study materials and learning resources to support your education.</p>
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

            {/* AI Assistant Button */}
            <button className="ai-assistant-button" onClick={toggleAiDialog}>
                <img src={robotIcon} alt="AI Assistant" />
            </button>

            {/* AI Assistant Dialog */}
            <div className={`ai-dialog ${isAiDialogOpen ? 'active' : ''}`}>
                <div className="ai-dialog-header">
                    <h3>AI Study Assistant</h3>
                    <button onClick={toggleAiDialog}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="ai-dialog-content">
                    <p>How can I help you today? I can:</p>
                    <ul>
                        <li>Explain any feature on this dashboard</li>
                        <li>Help you organize your study materials</li>
                        <li>Suggest study techniques</li>
                        <li>Answer questions about your courses</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

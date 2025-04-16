import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/Dashboard.css";
import axios from 'axios';

interface DashboardStats {
    totalUsers: number;
    activeGroups: number;
    totalQuizzes: number;
    recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
    }>;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeGroups: 0,
        totalQuizzes: 0,
        recentActivity: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/admin/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    {/* <p>Welcome back! Here's your overview for today.</p> */}
                </div>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <div className="value">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <h3>Active Study Groups</h3>
                    <div className="value">{stats.activeGroups}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Quizzes</h3>
                    <div className="value">{stats.totalQuizzes}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section admin-section">
                    <h2>User Management</h2>
                    <p>Manage user accounts, roles, and permissions.</p>
                    <Link to="/admin/users" className="action-button">Manage Users</Link>
                </div>

                <div className="dashboard-section admin-section">
                    <h2>Study Groups</h2>
                    <p>Create and manage study groups, assign moderators.</p>
                    <Link to="/admin/groups" className="action-button">Manage Groups</Link>
                </div>

                <div className="dashboard-section admin-section">
                    <h2>Content Management</h2>
                    <p>Manage study materials, quizzes, and resources.</p>
                    <Link to="/admin/content" className="action-button">Manage Content</Link>
                </div>

                <div className="dashboard-section admin-section">
                    <h2>Reports & Analytics</h2>
                    <p>View usage statistics and generate reports.</p>
                    <Link to="/admin/analytics" className="action-button">View Reports</Link>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Recent Activity</h2>
                <ul className="activity-list">
                    {stats.recentActivity.map(activity => (
                        <li key={activity.id} className="activity-item">
                            <span>{activity.description}</span>
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;

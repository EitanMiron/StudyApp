import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/Dashboard.css";

interface Analytics {
    userSignups: Array<{
        _id: string;
        count: number;
    }>;
    groupActivity: Array<{
        _id: string;
        count: number;
    }>;
    quizSubmissions: Array<{
        _id: string;
        count: number;
    }>;
    deadlineStats: Array<{
        _id: string;
        count: number;
        completed: number;
    }>;
}

const AdminAnalytics: React.FC = () => {
    const [analytics, setAnalytics] = useState<Analytics>({
        userSignups: [],
        groupActivity: [],
        quizSubmissions: [],
        deadlineStats: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/adminRoutes/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalytics(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login/admin');
                }
            }
        };

        fetchAnalytics();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Analytics & Reports</h1>
            </div>
            <div className="content-section">
                <div className="analytics-grid">
                    <div className="analytics-card">
                        <h2>User Signups</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>New Users</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.userSignups.map(stat => (
                                    <tr key={stat._id}>
                                        <td>{stat._id}</td>
                                        <td>{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="analytics-card">
                        <h2>Group Activity</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>New Groups</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.groupActivity.map(stat => (
                                    <tr key={stat._id}>
                                        <td>{stat._id}</td>
                                        <td>{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="analytics-card">
                        <h2>Quiz Submissions</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Submissions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.quizSubmissions.map(stat => (
                                    <tr key={stat._id}>
                                        <td>{stat._id}</td>
                                        <td>{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="analytics-card">
                        <h2>Deadline Completion</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.deadlineStats.map(stat => (
                                    <tr key={stat._id}>
                                        <td>{stat._id}</td>
                                        <td>{stat.count}</td>
                                        <td>{stat.completed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics; 
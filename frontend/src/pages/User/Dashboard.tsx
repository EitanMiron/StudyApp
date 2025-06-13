import React, { useState, useEffect } from 'react';
import { Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import AIAssistant from '../../components/AIAssistant';
import { useDashboardData } from '../../hooks/useDashboardData';
import '../../styles/Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { stats } = useDashboardData();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user stats here
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <Typography variant="h4" className="dashboard-title">
                        Welcome, {user?.name}!
                    </Typography>
                </div>
                <div className="dashboard-stats">
                    <Paper className="stat-card">
                        <Typography variant="h6">Study Groups</Typography>
                        <Typography variant="h4">{stats.enrolledGroups}</Typography>
                    </Paper>
                    <Paper className="stat-card">
                        <Typography variant="h6">Quizzes</Typography>
                        <Typography variant="h4">{stats.completedQuizzes}</Typography>
                    </Paper>
                    <Paper className="stat-card">
                        <Typography variant="h6">Notes</Typography>
                        <Typography variant="h4">{stats.totalNotes}</Typography>
                    </Paper>
                </div>
                <div className="ai-assistant-section">
                    <Typography variant="h5" className="section-title">
                        AI Study Assistant
                    </Typography>
                    <AIAssistant />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { Typography, Paper, CircularProgress, Box, Chip, Button, Card, CardContent } from '@mui/material';
import { Schedule as ScheduleIcon, Assignment as AssignmentIcon, Quiz as QuizIcon, Work as WorkIcon, School as SchoolIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import AIAssistant from '../../components/AIAssistant';
import { useDashboardData } from '../../hooks/useDashboardData';
import axios from 'axios';
import '../../styles/Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { stats, fetchDashboardData } = useDashboardData();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user stats here
        setLoading(false);
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('Dashboard stats:', stats);
        console.log('Upcoming deadlines in component:', stats.upcomingDeadlines);
        console.log('Number of deadlines:', stats.upcomingDeadlines?.length || 0);
    }, [stats]);

    const createTestDeadlines = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/userRoutes/create-test-deadlines', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Test deadlines created successfully');
            // Refresh dashboard data
            fetchDashboardData();
        } catch (error) {
            console.error('Error creating test deadlines:', error);
        }
    };

    const getDeadlineIcon = (type: string) => {
        switch (type) {
            case 'quiz':
                return <QuizIcon sx={{ fontSize: 20, color: '#3b82f6' }} />;
            case 'assignment':
                return <AssignmentIcon sx={{ fontSize: 20, color: '#10b981' }} />;
            case 'project':
                return <WorkIcon sx={{ fontSize: 20, color: '#f59e0b' }} />;
            case 'exam':
                return <SchoolIcon sx={{ fontSize: 20, color: '#ef4444' }} />;
            default:
                return <ScheduleIcon sx={{ fontSize: 20, color: '#6b7280' }} />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#ef4444';
            case 'medium':
                return '#f59e0b';
            case 'low':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return 'Overdue';
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getDaysUntilDue = (dueDate: string) => {
        const date = new Date(dueDate);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

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

                {/* Upcoming Deadlines Section */}
                <Box sx={{ marginTop: 3, marginBottom: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            Upcoming Deadlines
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                size="small"
                                onClick={createTestDeadlines}
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    backgroundColor: '#3b82f6',
                                    '&:hover': {
                                        backgroundColor: '#2563eb'
                                    }
                                }}
                            >
                                Create Test Deadlines
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small"
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    borderColor: '#d1d5db',
                                    color: '#6b7280',
                                    '&:hover': {
                                        borderColor: '#9ca3af',
                                        backgroundColor: '#f9fafb'
                                    }
                                }}
                            >
                                View All
                            </Button>
                        </Box>
                    </Box>
                    
                    {stats.upcomingDeadlines.length === 0 ? (
                        <Paper sx={{ 
                            padding: 3, 
                            textAlign: 'center',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb'
                        }}>
                            <ScheduleIcon sx={{ fontSize: 48, color: '#9ca3af', marginBottom: 1 }} />
                            <Typography variant="h6" sx={{ color: '#6b7280', marginBottom: 1 }}>
                                No upcoming deadlines
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                You're all caught up! Check back later for new assignments.
                            </Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 2 
                        }}>
                            {stats.upcomingDeadlines.slice(0, 3).map((deadline) => {
                                const daysUntilDue = getDaysUntilDue(deadline.dueDate);
                                const isOverdue = daysUntilDue < 0;
                                const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
                                
                                return (
                                    <Card key={deadline._id} sx={{ 
                                        height: '100%',
                                        border: isUrgent ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                        backgroundColor: isOverdue ? '#fef2f2' : isUrgent ? '#fef3c7' : 'white',
                                        '&:hover': {
                                            boxShadow: 3,
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}>
                                        <CardContent sx={{ padding: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                                {getDeadlineIcon(deadline.type)}
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        marginLeft: 1, 
                                                        fontWeight: 600,
                                                        color: isOverdue ? '#dc2626' : '#1f2937'
                                                    }}
                                                >
                                                    {deadline.title}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                                <Chip 
                                                    label={deadline.type} 
                                                    size="small" 
                                                    sx={{ 
                                                        backgroundColor: '#e5e7eb',
                                                        color: '#374151',
                                                        textTransform: 'capitalize',
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                                {deadline.priority && (
                                                    <Chip 
                                                        label={deadline.priority} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: getPriorityColor(deadline.priority),
                                                            color: 'white',
                                                            textTransform: 'capitalize',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                )}
                                                {deadline.status && (
                                                    <Chip 
                                                        label={deadline.status} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: deadline.status === 'Ready' ? '#22c55e' : deadline.status === 'Somewhat Ready' ? '#f59e42' : '#ef4444',
                                                            color: 'white',
                                                            textTransform: 'capitalize',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: isOverdue ? '#dc2626' : isUrgent ? '#d97706' : '#6b7280',
                                                    fontWeight: isUrgent || isOverdue ? 600 : 400,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {formatDueDate(deadline.dueDate)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}
                </Box>

                {/* All Deadlines Section */}
                <Box sx={{ marginTop: 3, marginBottom: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>
                        All Deadlines
                    </Typography>
                    {stats.allDeadlines.length === 0 ? (
                        <Paper sx={{ 
                            padding: 3, 
                            textAlign: 'center',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb'
                        }}>
                            <ScheduleIcon sx={{ fontSize: 48, color: '#9ca3af', marginBottom: 1 }} />
                            <Typography variant="h6" sx={{ color: '#6b7280', marginBottom: 1 }}>
                                No deadlines yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                Add a new deadline to get started!
                            </Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 2 
                        }}>
                            {stats.allDeadlines.map((deadline) => {
                                const daysUntilDue = getDaysUntilDue(deadline.dueDate);
                                const isOverdue = daysUntilDue < 0;
                                const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
                                return (
                                    <Card key={deadline._id} sx={{ 
                                        height: '100%',
                                        border: isUrgent ? '2px solid #ef4444' : '1px solid #e5e7eb',
                                        backgroundColor: isOverdue ? '#fef2f2' : isUrgent ? '#fef3c7' : 'white',
                                        '&:hover': {
                                            boxShadow: 3,
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}>
                                        <CardContent sx={{ padding: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                                                {getDeadlineIcon(deadline.type)}
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        marginLeft: 1, 
                                                        fontWeight: 600,
                                                        color: isOverdue ? '#dc2626' : '#1f2937'
                                                    }}
                                                >
                                                    {deadline.title}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1, gap: 1 }}>
                                                <Chip 
                                                    label={deadline.type} 
                                                    size="small" 
                                                    sx={{ 
                                                        backgroundColor: '#e5e7eb',
                                                        color: '#374151',
                                                        textTransform: 'capitalize',
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                                {deadline.priority && (
                                                    <Chip 
                                                        label={deadline.priority} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: getPriorityColor(deadline.priority),
                                                            color: 'white',
                                                            textTransform: 'capitalize',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                )}
                                                {deadline.status && (
                                                    <Chip 
                                                        label={deadline.status} 
                                                        size="small" 
                                                        sx={{ 
                                                            backgroundColor: deadline.status === 'Ready' ? '#22c55e' : deadline.status === 'Somewhat Ready' ? '#f59e42' : '#ef4444',
                                                            color: 'white',
                                                            textTransform: 'capitalize',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: isOverdue ? '#dc2626' : isUrgent ? '#d97706' : '#6b7280',
                                                    fontWeight: isUrgent || isOverdue ? 600 : 400,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {formatDueDate(deadline.dueDate)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
                                                <Button size="small" variant="outlined" color="primary">Edit</Button>
                                                <Button size="small" variant="outlined" color="error">Delete</Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}
                </Box>

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

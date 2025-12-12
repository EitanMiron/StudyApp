import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    ArrowBack as ArrowBackIcon,
    FilterList as FilterIcon,
    Quiz as QuizIcon,
    Description as ResourceIcon,
    Schedule as DeadlineIcon
} from '@mui/icons-material';

interface Content {
    quizzes: Array<{
        _id: string;
        title: string;
        description: string;
        questionCount: number;
        createdAt: string;
        createdBy?: string;
    }>;
    resources: Array<{
        _id: string;
        title: string;
        description: string;
        fileUrl: string;
        uploadDate: string;
        uploadedBy?: string;
    }>;
    deadlines: Array<{
        _id: string;
        title: string;
        type: string;
        dueDate: string;
        user: {
            name: string;
        };
    }>;
}

const AdminContent: React.FC = () => {
    const [content, setContent] = useState<Content>({
        quizzes: [],
        resources: [],
        deadlines: []
    });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/adminRoutes/content', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContent(response.data);
        } catch (error) {
            console.error('Error fetching content:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login/admin');
            }
            setSnackbar({ open: true, message: 'Failed to fetch content', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: '#f8fafc',
            padding: { xs: 2, md: 4 }
        }}>
            {/* Header Section */}
            <Paper elevation={0} sx={{ 
                backgroundColor: 'white', 
                borderRadius: 3,
                padding: 3,
                marginBottom: 3,
                border: '1px solid #e2e8f0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/admin')}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#cbd5e1',
                                color: '#64748b',
                                '&:hover': {
                                    borderColor: '#94a3b8',
                                    backgroundColor: '#f1f5f9'
                                }
                            }}
                        >
                            Back to Dashboard
                        </Button>
                        <Box>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <ResourceIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                                Content Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 0.5 }}>
                                Manage quizzes, resources, and deadlines across the platform
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Content Overview Cards */}
            <Grid container spacing={3}>
                <Grid columns={12} span={4}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#dbeafe'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <QuizIcon sx={{ fontSize: 48, color: '#1d4ed8', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#1d4ed8',
                                marginBottom: 1
                            }}>
                                {content.quizzes.length}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 600 }}>
                                Quizzes
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid columns={12} span={4}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#fef3c7'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <ResourceIcon sx={{ fontSize: 48, color: '#d97706', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#d97706',
                                marginBottom: 1
                            }}>
                                {content.resources.length}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#b45309', fontWeight: 600 }}>
                                Resources
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid columns={12} span={4}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#dcfce7'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <DeadlineIcon sx={{ fontSize: 48, color: '#15803d', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#15803d',
                                marginBottom: 1
                            }}>
                                {content.deadlines.length}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#166534', fontWeight: 600 }}>
                                Deadlines
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Content Sections */}
            <Grid container spacing={3}>
                {/* Quizzes Section */}
                <Grid columns={12} span={6}>
                    <Paper elevation={0} sx={{ 
                        backgroundColor: 'white', 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            backgroundColor: '#f8fafc', 
                            padding: 2,
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <QuizIcon sx={{ color: '#3b82f6' }} />
                                Recent Quizzes
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            {content.quizzes.slice(0, 5).map((quiz) => (
                                <Box key={quiz._id} sx={{ 
                                    padding: 2, 
                                    borderBottom: '1px solid #f1f5f9',
                                    '&:last-child': { borderBottom: 'none' }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {quiz.title}
                                        </Typography>
                                        <Chip 
                                            label={`${quiz.questionCount} questions`} 
                                            size="small" 
                                            color="primary"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', marginBottom: 1 }}>
                                        {quiz.description}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Resources Section */}
                <Grid columns={12} span={6}>
                    <Paper elevation={0} sx={{ 
                        backgroundColor: 'white', 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            backgroundColor: '#f8fafc', 
                            padding: 2,
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <ResourceIcon sx={{ color: '#f59e0b' }} />
                                Recent Resources
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            {content.resources.slice(0, 5).map((resource) => (
                                <Box key={resource._id} sx={{ 
                                    padding: 2, 
                                    borderBottom: '1px solid #f1f5f9',
                                    '&:last-child': { borderBottom: 'none' }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {resource.title}
                                        </Typography>
                                        <Button
                                            size="small"
                                            sx={{ 
                                                textTransform: 'none',
                                                color: '#3b82f6',
                                                minWidth: 'auto',
                                                padding: '4px 8px'
                                            }}
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#64748b', marginBottom: 1 }}>
                                        {resource.description}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Deadlines Section */}
                <Grid columns={12} span={12}>
                    <Paper elevation={0} sx={{ 
                        backgroundColor: 'white', 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            backgroundColor: '#f8fafc', 
                            padding: 2,
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <DeadlineIcon sx={{ color: '#10b981' }} />
                                Upcoming Deadlines
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            {content.deadlines.slice(0, 10).map((deadline) => (
                                <Box key={deadline._id} sx={{ 
                                    padding: 2, 
                                    borderBottom: '1px solid #f1f5f9',
                                    '&:last-child': { borderBottom: 'none' }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {deadline.title}
                                        </Typography>
                                        <Chip 
                                            label={deadline.type} 
                                            size="small" 
                                            color="default"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Assigned to: {deadline.user.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    severity={snackbar.severity} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ 
                        borderRadius: 2,
                        fontWeight: 600
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminContent;

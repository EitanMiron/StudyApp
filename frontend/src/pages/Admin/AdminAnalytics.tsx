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
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Group as GroupIcon,
    Quiz as QuizIcon,
    Schedule as DeadlineIcon,
    CalendarToday as CalendarIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';

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
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/adminRoutes/analytics?days=${timeRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login/admin');
            }
            setSnackbar({ open: true, message: 'Failed to fetch analytics', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (data: Array<{ count: number }>) => {
        return data.reduce((sum, item) => sum + item.count, 0);
    };

    const calculateAverage = (data: Array<{ count: number }>) => {
        if (data.length === 0) return 0;
        return Math.round(calculateTotal(data) / data.length);
    };

    const getRecentData = (data: Array<{ _id: string; count: number }>, limit: number = 7) => {
        return data.slice(-limit);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
                                <TrendingUpIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                                Analytics & Reports
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 0.5 }}>
                                Comprehensive insights into platform usage and user activity
                            </Typography>
                        </Box>
                    </Box>
                    
                    <FormControl size="small" sx={{ minWidth: '150px' }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            label="Time Range"
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="7">Last 7 days</MenuItem>
                            <MenuItem value="30">Last 30 days</MenuItem>
                            <MenuItem value="90">Last 90 days</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Key Metrics Cards */}
            <Grid container spacing={3} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#dbeafe'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <PeopleIcon sx={{ fontSize: 48, color: '#1d4ed8', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#1d4ed8',
                                marginBottom: 1
                            }}>
                                {calculateTotal(analytics.userSignups)}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 600 }}>
                                New Users
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 1 }}>
                                Avg: {calculateAverage(analytics.userSignups)}/day
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#fef3c7'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <GroupIcon sx={{ fontSize: 48, color: '#d97706', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#d97706',
                                marginBottom: 1
                            }}>
                                {calculateTotal(analytics.groupActivity)}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#b45309', fontWeight: 600 }}>
                                Groups Created
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 1 }}>
                                Avg: {calculateAverage(analytics.groupActivity)}/day
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#dcfce7'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <QuizIcon sx={{ fontSize: 48, color: '#15803d', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#15803d',
                                marginBottom: 1
                            }}>
                                {calculateTotal(analytics.quizSubmissions)}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#166534', fontWeight: 600 }}>
                                Quiz Submissions
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 1 }}>
                                Avg: {calculateAverage(analytics.quizSubmissions)}/day
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#fce7f3'
                    }}>
                        <CardContent sx={{ textAlign: 'center', padding: 3 }}>
                            <DeadlineIcon sx={{ fontSize: 48, color: '#be185d', marginBottom: 2 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#be185d',
                                marginBottom: 1
                            }}>
                                {calculateTotal(analytics.deadlineStats)}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#9d174d', fontWeight: 600 }}>
                                Deadlines
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 1 }}>
                                {analytics.deadlineStats.reduce((sum, item) => sum + item.completed, 0)} completed
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Analytics Sections */}
            <Grid container spacing={3}>
                {/* User Signups Chart */}
                <Grid item xs={12} md={6}>
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
                                <PeopleIcon sx={{ color: '#3b82f6' }} />
                                User Signups Trend
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>New Users</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Trend</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getRecentData(analytics.userSignups).map((stat, index) => (
                                            <TableRow key={stat._id} hover>
                                                <TableCell sx={{ color: '#64748b' }}>
                                                    {formatDate(stat._id)}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {stat.count}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={stat.count > 0 ? '↑' : '—'} 
                                                        size="small" 
                                                        color={stat.count > 0 ? 'success' : 'default'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Group Activity Chart */}
                <Grid item xs={12} md={6}>
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
                                <GroupIcon sx={{ color: '#f59e0b' }} />
                                Group Activity Trend
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>New Groups</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Trend</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getRecentData(analytics.groupActivity).map((stat) => (
                                            <TableRow key={stat._id} hover>
                                                <TableCell sx={{ color: '#64748b' }}>
                                                    {formatDate(stat._id)}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {stat.count}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={stat.count > 0 ? '↑' : '—'} 
                                                        size="small" 
                                                        color={stat.count > 0 ? 'success' : 'default'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Quiz Submissions Chart */}
                <Grid item xs={12} md={6}>
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
                                <QuizIcon sx={{ color: '#10b981' }} />
                                Quiz Submissions Trend
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Submissions</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Trend</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getRecentData(analytics.quizSubmissions).map((stat) => (
                                            <TableRow key={stat._id} hover>
                                                <TableCell sx={{ color: '#64748b' }}>
                                                    {formatDate(stat._id)}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {stat.count}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={stat.count > 0 ? '↑' : '—'} 
                                                        size="small" 
                                                        color={stat.count > 0 ? 'success' : 'default'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Deadline Completion Chart */}
                <Grid item xs={12} md={6}>
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
                                <DeadlineIcon sx={{ color: '#be185d' }} />
                                Deadline Completion Rate
                            </Typography>
                        </Box>
                        <Box sx={{ padding: 2 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Total</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Completed</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Rate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getRecentData(analytics.deadlineStats).map((stat) => {
                                            const completionRate = stat.count > 0 ? Math.round((stat.completed / stat.count) * 100) : 0;
                                            return (
                                                <TableRow key={stat._id} hover>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        {formatDate(stat._id)}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                        {stat.count}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>
                                                        {stat.completed}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={`${completionRate}%`} 
                                                            size="small" 
                                                            color={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'error'}
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Summary Section */}
            <Paper elevation={0} sx={{ 
                backgroundColor: 'white', 
                borderRadius: 3,
                padding: 3,
                marginTop: 3,
                border: '1px solid #e2e8f0'
            }}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#1e293b',
                    marginBottom: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <CalendarIcon sx={{ color: '#3b82f6' }} />
                    Platform Summary (Last {timeRange} days)
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', padding: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1d4ed8' }}>
                                {calculateTotal(analytics.userSignups)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Total New Users
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', padding: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
                                {calculateTotal(analytics.groupActivity)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Groups Created
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', padding: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#15803d' }}>
                                {calculateTotal(analytics.quizSubmissions)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Quiz Submissions
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center', padding: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#be185d' }}>
                                {analytics.deadlineStats.reduce((sum, item) => sum + item.completed, 0)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Deadlines Completed
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

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

export default AdminAnalytics;

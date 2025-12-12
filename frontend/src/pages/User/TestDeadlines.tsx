import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TestDeadlines: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const createTestDeadlines = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in first.');
                return;
            }

            const response = await axios.post('/api/userRoutes/create-test-deadlines', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage('Test deadlines created successfully! Redirecting to dashboard...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            
        } catch (error: any) {
            console.error('Error creating test deadlines:', error);
            setError(error.response?.data?.message || 'Failed to create test deadlines');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: 2
        }}>
            <Paper sx={{ 
                padding: 4, 
                maxWidth: 400, 
                width: '100%',
                textAlign: 'center'
            }}>
                <Typography variant="h4" sx={{ marginBottom: 2, color: '#1f2937' }}>
                    Create Test Deadlines
                </Typography>
                
                <Typography variant="body1" sx={{ marginBottom: 3, color: '#6b7280' }}>
                    This will create 3 test deadlines to verify the upcoming deadlines feature on your dashboard.
                </Typography>

                {message && (
                    <Alert severity="success" sx={{ marginBottom: 2 }}>
                        {message}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ marginBottom: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                        variant="contained" 
                        onClick={createTestDeadlines}
                        disabled={loading}
                        sx={{ 
                            backgroundColor: '#3b82f6',
                            '&:hover': { backgroundColor: '#2563eb' }
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Test Deadlines'}
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate('/dashboard')}
                        sx={{ 
                            borderColor: '#d1d5db',
                            color: '#6b7280',
                            '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                            }
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default TestDeadlines; 

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    Chip,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    ArrowBack as ArrowBackIcon,
    FilterList as FilterIcon,
    People as PeopleIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    loginCount: number;
}

interface UserStats {
    groupsCreated: number;
    quizzesCreated: number;
    notesCreated: number;
    deadlinesCreated: number;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [statsDialogOpen, setStatsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [editingUser, setEditingUser] = useState<Partial<User>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            if (debouncedSearchTerm !== searchTerm) {
                setSearchLoading(true);
            } else {
                setLoading(true);
            }
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                search: debouncedSearchTerm,
                role: roleFilter,
                status: statusFilter,
                page: page.toString(),
                limit: '10'
            });

            const response = await axios.get(`/api/adminRoutes/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setTotalUsers(response.data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login/admin');
            }
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [debouncedSearchTerm, roleFilter, statusFilter, page]);

    const handleEditUser = (user: User) => {
        setCurrentUser(user);
        setEditingUser({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });
        setEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/adminRoutes/users/${currentUser?._id}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
            setEditDialogOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
        }
    };

    const handleDeleteUser = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/adminRoutes/users/${currentUser?._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
            setDeleteDialogOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            setSnackbar({ 
                open: true, 
                message: error.response?.data?.message || 'Failed to delete user', 
                severity: 'error' 
            });
        }
    };

    const handleBulkDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/adminRoutes/users', {
                headers: { Authorization: `Bearer ${token}` },
                data: { userIds: selectedUsers }
            });
            
            setSnackbar({ open: true, message: `${selectedUsers.length} users deleted successfully`, severity: 'success' });
            setBulkDeleteDialogOpen(false);
            setSelectedUsers([]);
            fetchUsers();
        } catch (error: any) {
            console.error('Error bulk deleting users:', error);
            setSnackbar({ 
                open: true, 
                message: error.response?.data?.message || 'Failed to delete users', 
                severity: 'error' 
            });
        }
    };

    const handleViewStats = async (user: User) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/adminRoutes/users/${user._id}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUserStats(response.data.stats);
            setCurrentUser(user);
            setStatsDialogOpen(true);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            setSnackbar({ open: true, message: 'Failed to fetch user statistics', severity: 'error' });
        }
    };

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user._id));
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (filterType: 'role' | 'status', value: string) => {
        if (filterType === 'role') {
            setRoleFilter(value);
        } else {
            setStatusFilter(value);
        }
        setPage(1);
    };

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm]);

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
                                <PeopleIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                                User Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', marginTop: 0.5 }}>
                                Manage user accounts, roles, and permissions
                            </Typography>
                        </Box>
                    </Box>
                    
                    {selectedUsers.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setBulkDeleteDialogOpen(true)}
                            startIcon={<DeleteIcon />}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
                                '&:hover': {
                                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
                                }
                            }}
                        >
                            Delete Selected ({selectedUsers.length})
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Search and Filter Controls */}
            <Paper elevation={0} sx={{ 
                backgroundColor: 'white', 
                borderRadius: 3,
                padding: 3,
                marginBottom: 3,
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
                    <FilterIcon sx={{ color: '#3b82f6' }} />
                    Search & Filters
                </Typography>
                
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: '#94a3b8', marginRight: 1 }} />,
                                sx: {
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e2e8f0'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#cbd5e1'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3b82f6'
                                    }
                                }
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#64748b' }}>Role</InputLabel>
                            <Select
                                value={roleFilter}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                label="Role"
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e2e8f0'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#cbd5e1'
                                    }
                                }}
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#64748b' }}>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                label="Status"
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e2e8f0'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#cbd5e1'
                                    }
                                }}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSearchTerm('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                                setPage(1);
                            }}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '&:hover': {
                                    borderColor: '#94a3b8',
                                    backgroundColor: '#f1f5f9'
                                }
                            }}
                        >
                            Clear
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <Paper elevation={0} sx={{ 
                backgroundColor: 'white', 
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                minHeight: '400px'
            }}>
                {loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        padding: 8,
                        color: '#64748b'
                    }}>
                        <Typography variant="h6">Loading users...</Typography>
                    </Box>
                ) : (
                    <>
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
                                <AdminIcon sx={{ color: '#3b82f6' }} />
                                Users ({totalUsers})
                                {searchLoading && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1, 
                                        marginLeft: 2,
                                        color: '#3b82f6',
                                        fontSize: '0.875rem'
                                    }}>
                                        <Box sx={{ 
                                            width: 12, 
                                            height: 12, 
                                            borderRadius: '50%', 
                                            border: '2px solid #3b82f6',
                                            borderTop: '2px solid transparent',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': { transform: 'rotate(0deg)' },
                                                '100%': { transform: 'rotate(360deg)' }
                                            }
                                        }} />
                                        Searching...
                                    </Box>
                                )}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc' }}>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>
                                            <Checkbox
                                                checked={selectedUsers.length === users.length && users.length > 0}
                                                indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                                                onChange={handleSelectAll}
                                                sx={{ color: '#94a3b8' }}
                                            />
                                        </th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Name</th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Email</th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Role</th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Status</th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Created</th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Last Login</th>
                                        <th style={{ 
                                            padding: '16px', 
                                            textAlign: 'left', 
                                            borderBottom: '1px solid #e2e8f0',
                                            fontWeight: 600,
                                            color: '#475569'
                                        }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 && !searchLoading ? (
                                        <tr>
                                            <td colSpan={8} style={{ 
                                                padding: '32px', 
                                                textAlign: 'center', 
                                                color: '#64748b',
                                                fontStyle: 'italic'
                                            }}>
                                                No users found matching your search criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr key={user._id} style={{ 
                                                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                                                '&:hover': { backgroundColor: '#f1f5f9' }
                                            }}>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9'
                                                }}>
                                                    <Checkbox
                                                        checked={selectedUsers.includes(user._id)}
                                                        onChange={() => handleSelectUser(user._id)}
                                                        sx={{ color: '#94a3b8' }}
                                                    />
                                                </td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9',
                                                    fontWeight: 500,
                                                    color: '#1e293b'
                                                }}>{user.name}</td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9',
                                                    color: '#475569'
                                                }}>{user.email}</td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9'
                                                }}>
                                                    <Chip 
                                                        label={user.role} 
                                                        color={user.role === 'admin' ? 'primary' : 'default'}
                                                        size="small"
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            borderRadius: 1.5
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9'
                                                }}>
                                                    <Chip 
                                                        label={user.isActive ? 'Active' : 'Inactive'} 
                                                        color={user.isActive ? 'success' : 'error'}
                                                        size="small"
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            borderRadius: 1.5
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9',
                                                    color: '#64748b'
                                                }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9',
                                                    color: '#64748b'
                                                }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                                                <td style={{ 
                                                    padding: '16px', 
                                                    borderBottom: '1px solid #f1f5f9'
                                                }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="View Statistics">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleViewStats(user)}
                                                                sx={{ 
                                                                    color: '#3b82f6',
                                                                    '&:hover': { backgroundColor: '#dbeafe' }
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit User">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleEditUser(user)}
                                                                sx={{ 
                                                                    color: '#f59e0b',
                                                                    '&:hover': { backgroundColor: '#fef3c7' }
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete User">
                                                            <span>
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => {
                                                                        setCurrentUser(user);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                    disabled={user.role === 'admin'}
                                                                    sx={{ 
                                                                        color: user.role === 'admin' ? '#cbd5e1' : '#ef4444',
                                                                        '&:hover': { 
                                                                            backgroundColor: user.role === 'admin' ? 'transparent' : '#fee2e2' 
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Box>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </Box>

                        {/* Pagination */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: 3,
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc'
                        }}>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, totalUsers)} of {totalUsers} users
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        borderColor: '#e2e8f0',
                                        color: '#64748b',
                                        '&:hover': {
                                            borderColor: '#94a3b8',
                                            backgroundColor: '#f1f5f9'
                                        }
                                    }}
                                    variant="outlined"
                                >
                                    Previous
                                </Button>
                                <Typography variant="body2" sx={{ 
                                    padding: '8px 16px',
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    border: '1px solid #e2e8f0',
                                    color: '#475569',
                                    fontWeight: 600
                                }}>
                                    Page {page} of {totalPages}
                                </Typography>
                                <Button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        borderColor: '#e2e8f0',
                                        color: '#64748b',
                                        '&:hover': {
                                            borderColor: '#94a3b8',
                                            backgroundColor: '#f1f5f9'
                                        }
                                    }}
                                    variant="outlined"
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </Paper>

            {/* Edit User Dialog */}
            <Dialog 
                open={editDialogOpen} 
                onClose={() => setEditDialogOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 600,
                    color: '#1e293b'
                }}>
                    Edit User
                </DialogTitle>
                <DialogContent sx={{ padding: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={editingUser.name || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={editingUser.email || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={editingUser.role || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    label="Role"
                                    sx={{
                                        borderRadius: 2
                                    }}
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={editingUser.isActive ? 'active' : 'inactive'}
                                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                                    label="Status"
                                    sx={{
                                        borderRadius: 2
                                    }}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ padding: 3, backgroundColor: '#f8fafc' }}>
                    <Button 
                        onClick={() => setEditDialogOpen(false)}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            color: '#64748b'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveUser} 
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* User Statistics Dialog */}
            <Dialog 
                open={statsDialogOpen} 
                onClose={() => setStatsDialogOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: 600,
                    color: '#1e293b'
                }}>
                    User Statistics - {currentUser?.name}
                </DialogTitle>
                <DialogContent sx={{ padding: 3 }}>
                    {userStats && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Card sx={{ 
                                    backgroundColor: '#dbeafe',
                                    borderRadius: 2,
                                    border: '1px solid #bfdbfe'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', padding: 2 }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700, 
                                            color: '#1d4ed8',
                                            marginBottom: 1
                                        }}>
                                            {userStats.groupsCreated}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#1e40af' }}>
                                            Groups Created
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ 
                                    backgroundColor: '#fef3c7',
                                    borderRadius: 2,
                                    border: '1px solid #fde68a'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', padding: 2 }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700, 
                                            color: '#d97706',
                                            marginBottom: 1
                                        }}>
                                            {userStats.quizzesCreated}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#b45309' }}>
                                            Quizzes Created
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ 
                                    backgroundColor: '#dcfce7',
                                    borderRadius: 2,
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', padding: 2 }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700, 
                                            color: '#15803d',
                                            marginBottom: 1
                                        }}>
                                            {userStats.notesCreated}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#166534' }}>
                                            Notes Created
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card sx={{ 
                                    backgroundColor: '#fce7f3',
                                    borderRadius: 2,
                                    border: '1px solid #f9a8d4'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', padding: 2 }}>
                                        <Typography variant="h4" sx={{ 
                                            fontWeight: 700, 
                                            color: '#be185d',
                                            marginBottom: 1
                                        }}>
                                            {userStats.deadlinesCreated}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#9d174d' }}>
                                            Deadlines Created
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ padding: 3, backgroundColor: '#f8fafc' }}>
                    <Button 
                        onClick={() => setStatsDialogOpen(false)}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: '#fef2f2',
                    borderBottom: '1px solid #fecaca',
                    fontWeight: 600,
                    color: '#dc2626'
                }}>
                    Delete User
                </DialogTitle>
                <DialogContent sx={{ padding: 3 }}>
                    <Typography variant="body1" sx={{ marginBottom: 2, color: '#1e293b' }}>
                        Are you sure you want to delete user <strong>"{currentUser?.name}"</strong> ({currentUser?.email})?
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: '#dc2626', 
                        backgroundColor: '#fef2f2',
                        padding: 2,
                        borderRadius: 2,
                        border: '1px solid #fecaca'
                    }}>
                        ⚠️ This action will permanently delete the user and all their associated data (groups, quizzes, notes, etc.).
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: 3, backgroundColor: '#fef2f2' }}>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            color: '#64748b'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteUser} 
                        color="error" 
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog 
                open={bulkDeleteDialogOpen} 
                onClose={() => setBulkDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: '#fef2f2',
                    borderBottom: '1px solid #fecaca',
                    fontWeight: 600,
                    color: '#dc2626'
                }}>
                    Delete Multiple Users
                </DialogTitle>
                <DialogContent sx={{ padding: 3 }}>
                    <Typography variant="body1" sx={{ marginBottom: 2, color: '#1e293b' }}>
                        Are you sure you want to delete <strong>{selectedUsers.length}</strong> selected users?
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: '#dc2626', 
                        backgroundColor: '#fef2f2',
                        padding: 2,
                        borderRadius: 2,
                        border: '1px solid #fecaca'
                    }}>
                        ⚠️ This action will permanently delete all selected users and their associated data.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: 3, backgroundColor: '#fef2f2' }}>
                    <Button 
                        onClick={() => setBulkDeleteDialogOpen(false)}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            color: '#64748b'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBulkDelete} 
                        color="error" 
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>

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

export default AdminUsers; 

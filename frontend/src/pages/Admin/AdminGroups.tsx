import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Group {
    id: string;
    name: string;
    description: string;
    status: string;
    memberCount: number;
    createdAt: string;
    createdBy: {
        name: string;
        email: string;
    };
}

const AdminGroups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/adminRoutes/groups', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login/admin');
            }
        }
    };

    const handleEditClick = (group: Group) => {
        setSelectedGroup(group);
        setEditForm({ name: group.name, description: group.description });
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (group: Group) => {
        setSelectedGroup(group);
        setDeleteDialogOpen(true);
    };

    const handleEditSave = async () => {
        if (!selectedGroup) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/adminRoutes/groups/${selectedGroup.id}`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbar({ open: true, message: 'Group updated successfully', severity: 'success' });
            setEditDialogOpen(false);
            fetchGroups();
        } catch (error) {
            console.error('Error updating group:', error);
            setSnackbar({ open: true, message: 'Failed to update group', severity: 'error' });
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedGroup) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/adminRoutes/groups/${selectedGroup.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbar({ open: true, message: 'Group deleted successfully', severity: 'success' });
            setDeleteDialogOpen(false);
            fetchGroups();
        } catch (error) {
            console.error('Error deleting group:', error);
            setSnackbar({ open: true, message: 'Failed to delete group', severity: 'error' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Paper elevation={0} sx={{
                backgroundColor: 'white',
                borderRadius: 3,
                padding: 3,
                marginBottom: 3,
                border: '1px solid #e2e8f0'
            }}>
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
                    <GroupIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Study Groups Management
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', marginTop: 0.5 }}>
                            View and manage all study groups on the platform
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Groups Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Description</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Members</b></TableCell>
                            <TableCell><b>Owner</b></TableCell>
                            <TableCell><b>Created At</b></TableCell>
                            <TableCell align="center"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map(group => (
                            <TableRow key={group.id}>
                                <TableCell>{group.name}</TableCell>
                                <TableCell>{group.description}</TableCell>
                                <TableCell>
                                    <Typography sx={{
                                        color: group.status === 'active' ? '#22c55e' : '#f59e42',
                                        fontWeight: 600
                                    }}>
                                        {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                                    </Typography>
                                </TableCell>
                                <TableCell>{group.memberCount}</TableCell>
                                <TableCell>{group.createdBy.name} <br /><span style={{ color: '#64748b', fontSize: 13 }}>{group.createdBy.email}</span></TableCell>
                                <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        color="primary" 
                                        size="small"
                                        onClick={() => handleEditClick(group)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        size="small"
                                        onClick={() => handleDeleteClick(group)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Study Group</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        fullWidth
                        variant="outlined"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        sx={{ marginBottom: 2, marginTop: 1 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Study Group</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedGroup?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminGroups; 

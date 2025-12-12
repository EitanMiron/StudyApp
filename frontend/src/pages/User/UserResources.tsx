import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/Resources.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip } from '@mui/material';

interface Resource {
    _id: string;
    title: string;
    url: string;
    type: 'document' | 'video' | 'link' | 'other';
    uploadedBy: {
        name: string;
        email: string;
    };
    createdAt: string;
    tags: string[];
    groupId: string;
    description?: string;
}

interface Group {
    _id: string;
    name: string;
    subject: string;
    members: Array<{
        userId: string;
        role: string;
    }>;
}

const UserResources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newResource, setNewResource] = useState({
        title: '',
        url: '',
        type: 'link',
        description: '',
        groupId: '',
        tags: [] as string[]
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
    const [editedResource, setEditedResource] = useState({
        title: '',
        url: '',
        type: 'link' as 'document' | 'video' | 'link' | 'other',
        description: '',
        tags: [] as string[]
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login/user');
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };

                // First, fetch all groups the user is enrolled in
                const groupsResponse = await axios.get('/api/groupRoutes/groups', { headers });
                const userGroups = groupsResponse.data.filter((group: Group) => 
                    group.members.some(member => member.userId === localStorage.getItem('userId'))
                );
                setGroups(userGroups);

                // Then, fetch resources from each group
                const allResources: Resource[] = [];
                for (const group of userGroups) {
                    try {
                        const resourcesResponse = await axios.get(
                            `/api/resourceRoutes/groups/${group._id}/resources`,
                            { headers }
                        );
                        allResources.push(...resourcesResponse.data);
                    } catch (error) {
                        console.error(`Error fetching resources for group ${group._id}:`, error);
                    }
                }

                setResources(allResources);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch resources. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleCreateResource = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.post(
                `/api/resourceRoutes/groups/${newResource.groupId}/resources`,
                {
                    ...newResource,
                    type: newResource.type || 'link',
                    uploadedBy: localStorage.getItem('userId')
                },
                { headers }
            );

            const createdResource = {
                ...response.data,
                type: response.data.type || 'link',
                uploadedBy: response.data.uploadedBy || { name: 'Unknown User', email: '' }
            };

            setResources([...resources, createdResource]);
            setOpenCreateDialog(false);
            setNewResource({
                title: '',
                url: '',
                type: 'link',
                description: '',
                groupId: '',
                tags: []
            });
        } catch (error) {
            console.error('Error creating resource:', error);
            setError('Failed to create resource. Please try again.');
        }
    };

    const handleCloseDialog = () => {
        setOpenCreateDialog(false);
        setNewResource({
            title: '',
            url: '',
            type: 'link',
            description: '',
            groupId: '',
            tags: []
        });
    };

    const handleDeleteClick = (resource: Resource) => {
        setResourceToDelete(resource);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!resourceToDelete) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(
                `/api/resourceRoutes/groups/${resourceToDelete.groupId}/resources/${resourceToDelete._id}`,
                { headers }
            );

            setResources(resources.filter(r => r._id !== resourceToDelete._id));
            setDeleteDialogOpen(false);
            setResourceToDelete(null);
        } catch (error) {
            console.error('Error deleting resource:', error);
            setError('Failed to delete resource. Please try again.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setResourceToDelete(null);
    };

    const handleEditClick = (resource: Resource) => {
        setResourceToEdit(resource);
        setEditedResource({
            title: resource.title,
            url: resource.url,
            type: resource.type || 'link',
            description: resource.description || '',
            tags: resource.tags || []
        });
        setEditDialogOpen(true);
    };

    const handleEditConfirm = async () => {
        if (!resourceToEdit) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.put(
                `/api/resourceRoutes/groups/${resourceToEdit.groupId}/resources/${resourceToEdit._id}`,
                editedResource,
                { headers }
            );

            setResources(resources.map(r => 
                r._id === resourceToEdit._id ? { ...response.data, type: response.data.type || 'link' } : r
            ));
            setEditDialogOpen(false);
            setResourceToEdit(null);
        } catch (error) {
            console.error('Error updating resource:', error);
            setError('Failed to update resource. Please try again.');
        }
    };

    const handleEditCancel = () => {
        setEditDialogOpen(false);
        setResourceToEdit(null);
    };

    if (loading) {
        return (
            <div className="resources-page">
                <div className="resources-container">
                    <div className="resources-header">
                        <h1 className="resources-title">Loading resources...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="resources-page">
                <div className="resources-container">
                    <div className="resources-header">
                        <h1 className="resources-title">Error</h1>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Group resources by study group
    const resourcesByGroup = groups.reduce((acc, group) => {
        acc[group._id] = {
            name: group.name,
            subject: group.subject,
            resources: resources.filter(resource => resource.groupId === group._id)
        };
        return acc;
    }, {} as Record<string, { name: string; subject: string; resources: Resource[] }>);

    return (
        <div className="resources-page">
            <div className="resources-container">
                <div className="resources-header">
                    <Button
                        className="back-button"
                        onClick={() => navigate('/user')}
                        startIcon={<ArrowBackIcon />}
                        variant="text"
                        sx={{
                            color: '#2A7B9B',
                            '&:hover': {
                                backgroundColor: 'rgba(42, 123, 155, 0.1)'
                            }
                        }}
                    >
                        Back to Dashboard
                    </Button>
                    <div className="header-content">
                        <h1 className="resources-title">Study Resources</h1>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreateDialog(true)}
                            className="create-resource-button"
                        >
                            Add Resource
                        </Button>
                    </div>
                </div>

                <div className="resources-by-group">
                    {Object.entries(resourcesByGroup).map(([groupId, groupData]) => (
                        <div key={groupId} className="group-resources-section">
                            <h2 className="group-title">{groupData.name}</h2>
                            <p className="group-subject">{groupData.subject}</p>
                            
                            {groupData.resources.length === 0 ? (
                                <div className="no-resources">
                                    <p>No resources in this group yet.</p>
                                    <p>Click "Add Resource" to add study materials.</p>
                                </div>
                            ) : (
                                <div className="resources-grid">
                                    {groupData.resources.map(resource => (
                                        <div key={resource._id} className="resource-card">
                                            <div className="resource-header">
                                                <div className="resource-type">
                                                    <span className={`type ${resource.type || 'other'}`}>
                                                        {(resource.type || 'other').charAt(0).toUpperCase() + (resource.type || 'other').slice(1)}
                                                    </span>
                                                </div>
                                                <div className="resource-actions-header">
                                                    <Tooltip title="Edit Resource">
                                                        <IconButton
                                                            onClick={() => handleEditClick(resource)}
                                                            className="edit-button"
                                                            size="small"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Resource">
                                                        <IconButton
                                                            onClick={() => handleDeleteClick(resource)}
                                                            className="delete-button"
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            <h3>{resource.title}</h3>
                                            {resource.description && (
                                                <p className="resource-description">{resource.description}</p>
                                            )}
                                            <p>Uploaded by {resource.uploadedBy?.name || 'Unknown User'}</p>
                                            {resource.tags && resource.tags.length > 0 && (
                                                <div className="resource-tags">
                                                    {resource.tags.map(tag => (
                                                        <span key={tag} className="tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="resource-footer">
                                                <span className="resource-date">
                                                    Added: {new Date(resource.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="resource-actions">
                                                    <a 
                                                        href={resource.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="action-button primary"
                                                    >
                                                        View Resource
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <Dialog open={openCreateDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Study Group</InputLabel>
                            <Select
                                value={newResource.groupId}
                                onChange={(e) => setNewResource({ ...newResource, groupId: e.target.value })}
                                label="Study Group"
                            >
                                {groups.map(group => (
                                    <MenuItem key={group._id} value={group._id}>
                                        {group.name} ({group.subject})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Title"
                            value={newResource.title}
                            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={newResource.type}
                                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                                label="Type"
                            >
                                <MenuItem value="document">Document</MenuItem>
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="link">Link</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="URL"
                            value={newResource.url}
                            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Description"
                            multiline
                            rows={4}
                            value={newResource.description}
                            onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button 
                            onClick={handleCreateResource}
                            variant="contained"
                            disabled={!newResource.title || !newResource.url || !newResource.groupId}
                        >
                            Create Resource
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={deleteDialogOpen}
                    onClose={handleDeleteCancel}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Delete Resource</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to delete this resource?</p>
                        {resourceToDelete && (
                            <div className="delete-resource-info">
                                <h4>{resourceToDelete.title}</h4>
                                <p>Type: {(resourceToDelete.type || 'other').charAt(0).toUpperCase() + (resourceToDelete.type || 'other').slice(1)}</p>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel}>Cancel</Button>
                        <Button 
                            onClick={handleDeleteConfirm}
                            variant="contained"
                            color="error"
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={editDialogOpen}
                    onClose={handleEditCancel}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Edit Resource</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Title"
                            value={editedResource.title}
                            onChange={(e) => setEditedResource({ ...editedResource, title: e.target.value })}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={editedResource.type}
                                onChange={(e) => setEditedResource({ ...editedResource, type: e.target.value as any })}
                                label="Type"
                            >
                                <MenuItem value="document">Document</MenuItem>
                                <MenuItem value="video">Video</MenuItem>
                                <MenuItem value="link">Link</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="URL"
                            value={editedResource.url}
                            onChange={(e) => setEditedResource({ ...editedResource, url: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Description"
                            multiline
                            rows={4}
                            value={editedResource.description}
                            onChange={(e) => setEditedResource({ ...editedResource, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditCancel}>Cancel</Button>
                        <Button 
                            onClick={handleEditConfirm}
                            variant="contained"
                            disabled={!editedResource.title || !editedResource.url}
                        >
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default UserResources; 

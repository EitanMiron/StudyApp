import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Autocomplete, Alert, Snackbar, InputAdornment } from '@mui/material';
import StudyGroupCard from '../../components/StudyGroupCard';
import { Group } from '../../types/group';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/StudyGroups.css';
import { AddIcon, SearchIcon } from '../../components/icons';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDashboardData } from '../../hooks/useDashboardData';

interface GroupMember {
    userId: string;
    role: string;
    joinedAt: Date;
}

interface StudyGroup {
    _id: string;
    name: string;
    subject: string;
    description: string;
    createdBy: string;
    createdAt: Date;
    members: GroupMember[];
}

const StudyGroups: React.FC = () => {
  const navigate = useNavigate();
  const { fetchDashboardData } = useDashboardData();
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrolledGroups, setEnrolledGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    subject: '',
    description: '',
    invitedUsers: [] as string[]
  });
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login/user');
      return false;
    }
    return true;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return { Authorization: `Bearer ${token}` };
  };

  const getUserId = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user ID found');
    }
    return userId;
  };

  useEffect(() => {
    if (checkAuth()) {
      fetchGroups();
      fetchUsers();
      fetchInvitations();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      if (!checkAuth()) return;
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:4000/api/authRoutes/all', { headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    }
  };

  const fetchGroups = async () => {
    try {
      if (!checkAuth()) return;
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:4000/api/groupRoutes/groups', { headers });
      setGroups(response.data);
      
      const userId = getUserId();
      const userGroups = response.data.filter((group: Group) => 
        group.members.some(member => member.userId === userId)
      );
      setEnrolledGroups(userGroups);
      // Update dashboard data after fetching groups
      await fetchDashboardData();
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to fetch groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      if (!checkAuth()) return;
      const userId = getUserId();
      const headers = getAuthHeaders();
      const res = await axios.get(`http://localhost:4000/api/invitations/user/${userId}`, { headers });
      setInvitations(res.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError('Failed to fetch invitations. Please try again.');
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`http://localhost:4000/api/invitations/${invitationId}/accept`, {}, { headers });
      fetchGroups();
      fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again.');
    }
  };
  
  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`http://localhost:4000/api/invitations/${invitationId}/decline`, {}, { headers });
      fetchInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
      setError('Failed to decline invitation. Please try again.');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        navigate('/login/user');
        return;
      }

      const response = await axios.post(
        'http://localhost:4000/api/groupRoutes/join',
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group._id === groupId 
              ? { 
                  ...group, 
                  members: [...group.members, { 
                    userId, 
                    role: 'member',
                    joinedAt: new Date()
                  }]
              }
              : group
          )
        );
        setSnackbar({
          open: true,
          message: 'Successfully joined the group!',
          severity: 'success'
        });
        // Update dashboard data after joining
        await fetchDashboardData();
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to join group',
        severity: 'error'
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        navigate('/login/user');
        return;
      }

      const response = await axios.post(
        'http://localhost:4000/api/groupRoutes/leave',
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group._id === groupId 
              ? { 
                  ...group, 
                  members: group.members.filter(member => member.userId !== userId)
              }
              : group
          )
        );
        setSnackbar({
          open: true,
          message: 'Successfully left the group',
          severity: 'success'
        });
        // Update dashboard data after leaving
        await fetchDashboardData();
      }
    } catch (error: any) {
      console.error('Error leaving group:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to leave group',
        severity: 'error'
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.subject || !newGroup.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4000/api/groupRoutes/groups',
        {
          ...newGroup,
          userId: getUserId()
        },
        {
          headers: getAuthHeaders()
        }
      );
      setGroups([...groups, response.data]);
      setNewGroup({ name: '', subject: '', description: '', invitedUsers: [] });
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login/user');
            return;
        }

        const response = await axios.delete(
            `http://localhost:4000/api/groupRoutes/groups/${groupId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.message === 'Group deleted successfully') {
            setGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
            setEnrolledGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
            setSnackbar({
                open: true,
                message: 'Group deleted successfully',
                severity: 'success'
            });
            // Update dashboard data after deletion
            await fetchDashboardData();
        }
    } catch (error: any) {
        console.error('Error deleting group:', error);
        setSnackbar({
            open: true,
            message: error.response?.data?.error || 'Failed to delete group',
            severity: 'error'
        });
    }
  };

  const filteredGroups = groups
    .filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by exact matches first
      const aNameMatch = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bNameMatch = b.name.toLowerCase() === searchTerm.toLowerCase();
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      // Then sort by starts with
      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm.toLowerCase());
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Finally sort by contains
      const aContains = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bContains = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      return 0;
    });

  if (loading) {
    return <Typography className="loading-text">Loading...</Typography>;
  }

  return (
    <>
      <div className="study-groups-page" />
      <div className="study-groups-container">
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <div className="header-container">
            <div className="header-top">
                <div className="header-left">
                    <Button
                        className="back-button"
                        onClick={() => navigate('/user')}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back to Dashboard
                    </Button>
                </div>
                <div className="header-center">
                    <Typography variant="h4" className="header-title">
                        Study Groups
                    </Typography>
                    <div className="header-stats">
                        <Typography variant="subtitle1" className="enrolled-count">
                            Enrolled in {enrolledGroups.length} {enrolledGroups.length === 1 ? 'group' : 'groups'}
                        </Typography>
                    </div>
                </div>
                <div className="header-right">
                    <Button
                        variant="contained"
                        className="create-group-button"
                        onClick={() => setOpenCreateDialog(true)}
                        startIcon={<AddIcon />}
                    >
                        Create Group
                    </Button>
                </div>
            </div>
            <div className="search-container">
                <TextField
                    className="search-bar"
                    placeholder="Search groups by name, subject, or description..."
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon style={{ color: '#1a5a73' }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
        </div>

        {/* Invitations Section */}
        {invitations.length > 0 && (
          <Box className="invitations-box">
            <Typography variant="h6" className="invitation-title">
              You have {invitations.length} group invitation{invitations.length > 1 ? 's' : ''}
            </Typography>
            {invitations.map((invitation) => (
              <Box key={invitation._id} className="invitation-card">
                <Typography>
                  <strong>{invitation.inviterId.name}</strong> invited you to join <strong>{invitation.groupId.name}</strong>
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAcceptInvitation(invitation._id)}
                  className="accept-btn"
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDeclineInvitation(invitation._id)}
                  className="decline-btn"
                >
                  Decline
                </Button>
              </Box>
            ))}
          </Box>
        )}

        <div className="groups-list">
          {filteredGroups.map((group) => (
            <div key={group._id} className="group-card">
              <StudyGroupCard
                group={group}
                onJoin={handleJoinGroup}
                onLeave={handleLeaveGroup}
                onDelete={handleDeleteGroup}
                isEnrolled={group.members.some(member => 
                  member.userId === localStorage.getItem('userId')
                )}
              />
            </div>
          ))}
        </div>

        <Dialog 
          open={openCreateDialog} 
          onClose={() => setOpenCreateDialog(false)}
          disableEnforceFocus
          disableAutoFocus
        >
          <DialogTitle>Create New Study Group</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              type="text"
              fullWidth
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Subject"
              type="text"
              fullWidth
              value={newGroup.subject}
              onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            />
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => option.name}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Invite Users"
                  placeholder="Search users to invite..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={`${option.id}-${index}`}
                      label={option.name}
                      {...chipProps}
                    />
                  );
                })
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionKey={(option) => option.id}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateGroup} 
              variant="contained" 
              color="primary"
              disabled={!newGroup.name || !newGroup.subject}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default StudyGroups;

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Autocomplete, InputAdornment } from '@mui/material';
import StudyGroupCard from '../../components/StudyGroupCard';
import { Group } from '../../types/group';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/StudyGroups.css';
import { AddIcon, SearchIcon } from '../../components/icons';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDashboardData } from '../../hooks/useDashboardData';

const StudyGroups: React.FC = () => {
  const navigate = useNavigate();
  const { fetchDashboardData } = useDashboardData();
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrolledGroups, setEnrolledGroups] = useState<Group[]>([]);
  const [exitedGroups, setExitedGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [activeFolder, setActiveFolder] = useState('current'); // 'current' or 'exited'
  const [currentPage, setCurrentPage] = useState(1); // Added for pagination
  const [cardsPerPage] = useState(6); // Added for pagination: 6 cards per page
  const [newGroup, setNewGroup] = useState({
    name: '',
    subject: '',
    description: '',
    invitedUsers: [] as string[]
  });
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; name: string }[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [processingGroupId, setProcessingGroupId] = useState<string | null>(null); // Track which group is being processed

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
      const response = await axios.get('/api/authRoutes/all', { headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      if (!checkAuth()) return;
      const headers = getAuthHeaders();
      const response = await axios.get('/api/groupRoutes/groups', { headers });
      setGroups(response.data);
      
      const userId = getUserId();

      // Get all groups where user is a member
      const userGroups = response.data.filter((group: Group) => 
        group.members.some(member => {
            // Handle potential object/string mismatch
            const memberId = typeof member.userId === 'object' ? (member.userId as any)._id : member.userId;
            return memberId === userId;
        })
      );
      setEnrolledGroups(userGroups);

      // Get all groups where user is not a member
      const nonUserGroups = response.data.filter((group: Group) => 
        !group.members.some(member => {
            const memberId = typeof member.userId === 'object' ? (member.userId as any)._id : member.userId;
            return memberId === userId;
        })
      );
      setExitedGroups(nonUserGroups);
      
      // Update dashboard data after fetching groups
      await fetchDashboardData();
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      if (!checkAuth()) return;
      const userId = getUserId();
      const headers = getAuthHeaders();
      const res = await axios.get(`/api/invitations/user/${userId}`, { headers });
      setInvitations(res.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`/api/invitations/${invitationId}/accept`, {}, { headers });
      fetchGroups();
      fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };
  
  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`/api/invitations/${invitationId}/decline`, {}, { headers });
      fetchInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (processingGroupId === groupId) return; // Prevent double clicks
    setProcessingGroupId(groupId);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        navigate('/login/user');
        return;
      }

      const response = await axios.post(
        `/api/groupRoutes/groups/${groupId}/join`,
        { userId, role: 'member' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === 'Joined group successfully') {
        // Update the groups state with the updated group
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group._id === groupId 
              ? response.data.group
              : group
          )
        );
        
        // Update enrolled groups
        setEnrolledGroups(prevGroups => [...prevGroups, response.data.group]);
        
        // Remove from exited groups if it was there
        setExitedGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
        
        // Update dashboard data
        await fetchDashboardData();
      }
    } catch (error: any) {
      console.error('Error joining group:', error.response?.data || error.message || error);
    } finally {
      setProcessingGroupId(null);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (processingGroupId === groupId) return; // Prevent double clicks
    setProcessingGroupId(groupId);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        navigate('/login/user');
        return;
      }

      const response = await axios.post(
        `/api/groupRoutes/groups/${groupId}/leave`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === 'Left group successfully') {
        // Move group to exited groups
        const leftGroup = groups.find(group => group._id === groupId);
        if (leftGroup) {
          // Update the group object to reflect that the user is no longer a member
          // This is crucial because 'groups' state holds the source of truth for "All Groups"
          const updatedGroup = {
             ...leftGroup,
             members: leftGroup.members.filter(m => {
                 const mId = typeof m.userId === 'object' ? (m.userId as any)._id : m.userId;
                 return mId !== userId;
             })
          };
          
          setExitedGroups(prev => [...prev, updatedGroup]);
          
          // Update the group in the main 'groups' list instead of removing it
          setGroups(prevGroups => prevGroups.map(g => g._id === groupId ? updatedGroup : g));
        }
        
        // Update enrolled groups
        setEnrolledGroups(prevGroups => 
          prevGroups.filter(group => group._id !== groupId)
        );
        
        // Update dashboard data
        await fetchDashboardData();
      }
    } catch (error: any) {
      console.error('Error leaving group:', error.response?.data || error.message || error);
    } finally {
      setProcessingGroupId(null);
    }
  };

  // const handleRejoinGroup = async (groupId: string) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const userId = localStorage.getItem('userId');
      
  //     if (!token || !userId) {
  //       navigate('/login/user');
  //       return;
  //     }

  //     // Find the group to check if user is creator
  //     const groupToJoin = exitedGroups.find(g => g._id === groupId);
  //     const role = (groupToJoin && groupToJoin.createdBy === userId) ? 'admin' : 'member';

  //     const response = await axios.post(
  //       `/api/groupRoutes/groups/${groupId}/join`,
  //       { userId, role },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response.data.message === 'Joined group successfully') {
  //       // Move group back to current groups
  //       setExitedGroups(prev => prev.filter(group => group._id !== groupId));
  //       setGroups(prevGroups => [...prevGroups, response.data.group]);
  //       setEnrolledGroups(prevGroups => [...prevGroups, response.data.group]);
  //       await fetchDashboardData();
  //     }
  //   } catch (error: any) {
  //     console.error('Error rejoining group:', error);
  //   }
  // };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.subject || !newGroup.description) {
      return;
    }

    try {
      const response = await axios.post(
        '/api/groupRoutes/groups',
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
    }
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
        `/api/groupRoutes/groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message === 'Group deleted successfully') {
        // Remove from all groups lists
        setGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
        setEnrolledGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
        setExitedGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
        
        // Update dashboard data
        await fetchDashboardData();
      }
    } catch (error: any) {
      console.error('Error deleting group:', error);
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

  // Get current cards for pagination
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;

  // Filter groups based on active folder AND pagination
  const paginatedDisplayGroups = activeFolder === 'current' 
    ? filteredGroups.slice(indexOfFirstCard, indexOfLastCard)
    : exitedGroups.slice(indexOfFirstCard, indexOfLastCard);

  const totalPages = Math.ceil((activeFolder === 'current' ? filteredGroups.length : exitedGroups.length) / cardsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return <Typography className="loading-text">Loading...</Typography>;
  }

  return (
    <div className="study-groups-page">
      <div className="header-container">
        <div className="header-left">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/user')}
            className="back-button"
          >
            Back to Dashboard
          </Button>
        </div>
        <div className="header-center">
          <Typography variant="h4" className="header-title">Study Groups</Typography>
          <Box className="search-container">
            <TextField
              className="search-bar"
              variant="outlined"
              placeholder="Search groups by name, subject, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                      <SearchIcon />
                  </InputAdornment>
                ),
                className: 'search-input'
              }}
            />
          </Box>
        </div>
        <div className="header-right">
          <Button
            onClick={() => setOpenCreateDialog(true)}
            className="add-group-button"
            startIcon={<AddIcon />}
          >
            Create Group
          </Button>
        </div>
      </div>

      <div className="main-content-wrapper">
        <div className="sidebar">
          <div 
            className={`sidebar-folder ${activeFolder === 'current' ? 'active' : ''}`}
            onClick={() => {
              setActiveFolder('current');
              setCurrentPage(1); // Reset to first page on folder change
            }}
          >
            All Groups ({groups.length})
          </div>
          <div 
            className={`sidebar-folder ${activeFolder === 'exited' ? 'active' : ''}`}
            onClick={() => {
              setActiveFolder('exited');
              setCurrentPage(1); // Reset to first page on folder change
            }}
          >
            Available Groups ({exitedGroups.length})
          </div>
          <Box className="sidebar-enrolled-count">
              <Typography variant="subtitle1" className="enrolled-count">
                  Enrolled in {enrolledGroups.length} {enrolledGroups.length === 1 ? 'group' : 'groups'}
              </Typography>
          </Box>
        </div>

        <div className="main-content">
          <Container className="study-groups-container">
            {invitations.length > 0 && activeFolder === 'current' && ( // Only show invitations in current groups
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

            {activeFolder === 'current' ? (
              <div className="groups-list">
                {paginatedDisplayGroups.map((group) => {
                  const currentUserId = localStorage.getItem('userId');
                  const isEnrolled = group.members.some(member => {
                    const memberId = typeof member.userId === 'object' ? (member.userId as any)._id : member.userId;
                    return memberId === currentUserId;
                  });
                  
                  return (
                    <div key={group._id} className="group-card">
                      <StudyGroupCard
                        group={group}
                        onJoin={handleJoinGroup}
                        onLeave={handleLeaveGroup}
                        onDelete={handleDeleteGroup}
                        isEnrolled={isEnrolled}
                        disabled={processingGroupId === group._id}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="exited-groups-list">
                {paginatedDisplayGroups.map((group) => (
                  <div key={group._id} className="group-card">
                    <StudyGroupCard
                      group={group}
                      onJoin={handleJoinGroup} 
                      onLeave={() => {}} 
                      onDelete={handleDeleteGroup}
                      isEnrolled={false}
                      isExited={false}
                      disabled={processingGroupId === group._id}
                    />
                  </div>
                ))}
              </div>
            )}            {totalPages > 1 && (
              <Box className="pagination-dots">
                {Array.from({ length: totalPages }, (_, i) => (
                  <span
                    key={i}
                    className={`dot ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => paginate(i + 1)}
                  ></span>
                ))}
              </Box>
            )}

            <Dialog 
              open={openCreateDialog} 
              onClose={() => setOpenCreateDialog(false)}
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
                  onChange={(_, newValue) => setNewGroup({ ...newGroup, invitedUsers: newValue.map(user => user.id) })} // Update invitedUsers
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
                  getOptionKey={(option) => option.id} // Added getOptionKey
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
          </Container>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;

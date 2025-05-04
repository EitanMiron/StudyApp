import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Autocomplete } from '@mui/material';
import StudyGroupCard from '../components/StudyGroupCard';
import { Group } from '../types/group';
import axios from 'axios';
import '../styles/StudyGroups.css';

const StudyGroups: React.FC = () => {
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

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/userRoutes/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groupRoutes/groups');
      setGroups(response.data);
      
      // Filter groups where current user is a member
      const userGroups = response.data.filter((group: Group) => 
        group.members.includes(localStorage.getItem('userId') || '')
      );
      setEnrolledGroups(userGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.post(`/api/groups/${groupId}/join`, { userId });
      fetchGroups(); // Refresh the groups list
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      await axios.post(`/api/groups/${groupId}/leave`, { userId });
      fetchGroups(); // Refresh the groups list
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User not logged in');
        return;
      }

      // Validate required fields
      if (!newGroup.name.trim() || !newGroup.subject.trim()) {
        console.error('Group name and subject are required');
        return;
      }

      const response = await axios.post('/api/groupRoutes/groups', {
        name: newGroup.name.trim(),
        subject: newGroup.subject.trim(),
        description: newGroup.description.trim(),
        members: [userId],
        invitedUsers: selectedUsers.map(user => user.id)
      });

      // Send invitations to selected users
      if (selectedUsers.length > 0) {
        await Promise.all(selectedUsers.map(user => 
          axios.post('/api/invitations', {
            groupId: response.data._id,
            userId: user.id,
            inviterId: userId
          })
        ));
      }

      setOpenCreateDialog(false);
      setNewGroup({ name: '', subject: '', description: '', invitedUsers: [] });
      setSelectedUsers([]);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <Typography className="loading-text">Loading...</Typography>;
  }

  return (
    <div className="study-groups-container">
      <div className="study-groups-header">
        <div className="header-top">
          <div className="header-top-row">
            <Typography variant="h4" className="study-groups-title">
              Study Groups
            </Typography>
          </div>
          <Button 
            variant="contained" 
            className="create-group-button"
            onClick={() => setOpenCreateDialog(true)}
          >
            Create Group
          </Button>
        </div>
        <Typography variant="subtitle1" className="study-groups-subtitle">
          You are enrolled in {enrolledGroups.length} groups
        </Typography>
        <div className="search-container">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search groups by name, subject, or member..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="groups-list">
        {filteredGroups.map((group) => (
          <div key={group._id} className="group-card">
            <StudyGroupCard
              group={group}
              onJoin={handleJoinGroup}
              onLeave={handleLeaveGroup}
              isEnrolled={group.members.includes(localStorage.getItem('userId') || '')}
            />
          </div>
        ))}
      </div>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
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
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                />
              ))
            }
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
  );
};

export default StudyGroups; 
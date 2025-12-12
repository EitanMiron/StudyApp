import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Group } from '../types/group';
import '../styles/StudyGroups.css';
import DeleteIcon from '@mui/icons-material/Delete';

interface StudyGroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
  isEnrolled: boolean;
  isExited?: boolean;
  disabled?: boolean;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ 
  group, 
  onJoin, 
  onLeave, 
  onDelete,
  isEnrolled,
  isExited = false,
  disabled = false
}) => {
  const userId = localStorage.getItem('userId');
  
  const isMemberAdmin = group.members.some(member => {
    const memberId = typeof member.userId === 'object' ? (member.userId as any)._id : member.userId;
    return memberId === userId && member.role === 'admin';
  });

  const isCreator = typeof group.createdBy === 'object' 
    ? (group.createdBy as any)._id === userId 
    : group.createdBy === userId;

  const canDelete = isMemberAdmin || isCreator;

  return (
    <Card className={`study-group-card ${isExited ? 'mini-card' : ''}`}>
      <CardContent>
        <Typography variant="h6" component="div">
          {group.name}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {group.subject}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {group.description}
        </Typography>
        {isCreator ? (
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'primary.main', fontStyle: 'italic' }}>
            Created by you
          </Typography>
        ) : (
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.disabled', fontStyle: 'italic' }}>
            Created by another user
          </Typography>
        )}
        <Box className="group-actions">
          {isEnrolled ? (
            <>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => onLeave(group._id)}
                disabled={disabled}
              >
                Leave Group
              </Button>
              {canDelete && onDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(group._id)}
                  sx={{ ml: 1 }}
                  disabled={disabled}
                >
                  Delete Group
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => onJoin(group._id)}
                disabled={disabled}
              >
                {isExited ? 'Rejoin Group' : 'Join Group'}
              </Button>
              {canDelete && onDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(group._id)}
                  sx={{ ml: 1 }}
                  disabled={disabled}
                >
                  Delete Group
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudyGroupCard;

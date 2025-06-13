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
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ 
  group, 
  onJoin, 
  onLeave, 
  onDelete,
  isEnrolled,
  isExited = false
}) => {
  const userId = localStorage.getItem('userId');
  const isAdmin = group.members.some(member => 
    member.userId === userId && member.role === 'admin'
  );

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
        <Box className="group-actions">
          {isEnrolled ? (
            <>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => onLeave(group._id)}
              >
                Leave Group
              </Button>
              {isAdmin && onDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(group._id)}
                  sx={{ ml: 1 }}
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
              >
                {isExited ? 'Rejoin Group' : 'Join Group'}
              </Button>
              {isAdmin && onDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(group._id)}
                  sx={{ ml: 1 }}
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

import React from 'react';
import { Typography, Button } from '@mui/material';
import { Group } from '../types/group';
import '../styles/StudyGroups.css';

interface StudyGroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  isEnrolled: boolean;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ group, onJoin, onLeave, isEnrolled }) => {
  return (
    <div>
      <div className="group-header">
        <div>
          <Typography variant="h6" className="group-title">
            {group.name}
          </Typography>
          <Typography color="text.secondary" className="group-subject">
            {group.subject}
          </Typography>
          <Typography variant="body2" className="group-description">
            {group.description}
          </Typography>
          <div className="group-meta">
            <span className="member-count">
              {group.members.length} members
            </span>
          </div>
        </div>
        <div>
          {isEnrolled ? (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => onLeave(group._id)}
              className="action-button leave-button"
            >
              Leave Group
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => onJoin(group._id)}
              className="action-button join-button"
            >
              Join Group
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGroupCard;

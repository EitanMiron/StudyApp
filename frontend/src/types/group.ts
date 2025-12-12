export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  subject: string;
  description: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
} 

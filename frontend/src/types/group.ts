export interface Group {
  _id: string;
  name: string;
  subject: string;
  description: string;
  members: string[]; // Array of user IDs
  createdAt: string;
  updatedAt: string;
} 
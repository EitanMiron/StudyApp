import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/Dashboard.css";

interface Group {
    id: string;
    name: string;
    description: string;
    status: string;
    memberCount: number;
    createdAt: string;
    owner: {
        name: string;
        email: string;
    };
}

const AdminGroups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
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

        fetchGroups();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Study Groups Management</h1>
            </div>
            <div className="content-section">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Members</th>
                            <th>Owner</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map(group => (
                            <tr key={group.id}>
                                <td>{group.name}</td>
                                <td>{group.description}</td>
                                <td>{group.status}</td>
                                <td>{group.memberCount}</td>
                                <td>{group.owner.name} ({group.owner.email})</td>
                                <td>{new Date(group.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-button">Edit</button>
                                    <button className="action-button delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminGroups; 
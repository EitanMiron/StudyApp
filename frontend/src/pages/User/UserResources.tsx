import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import "../styles/Dashboard.css";
import "../../styles/Dashboard.css"

interface Resource {
    id: string;
    title: string;
    description: string;
    type: 'document' | 'video' | 'link' | 'other';
    fileUrl: string;
    uploadDate: string;
    tags: string[];
}

const UserResources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/userRoutes/resources', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResources(response.data);
            } catch (error) {
                console.error('Error fetching resources:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login/user');
                }
            }
        };

        fetchResources();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Study Resources</h1>
            </div>
            <div className="content-section">
                <div className="resources-grid">
                    {resources.map(resource => (
                        <div key={resource.id} className="resource-card">
                            <div className="resource-type">
                                <span className={`type ${resource.type}`}>
                                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                </span>
                            </div>
                            <h3>{resource.title}</h3>
                            <p>{resource.description}</p>
                            <div className="resource-tags">
                                {resource.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            <div className="resource-footer">
                                <span className="date">
                                    Added: {new Date(resource.uploadDate).toLocaleDateString()}
                                </span>
                                <div className="resource-actions">
                                    <a 
                                        href={resource.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="action-button"
                                    >
                                        View Resource
                                    </a>
                                    <button className="action-button">Download</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserResources; 
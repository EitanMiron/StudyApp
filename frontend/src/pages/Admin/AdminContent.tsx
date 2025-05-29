import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../styles/Dashboard.css";

interface Content {
    quizzes: Array<{
        id: string;
        title: string;
        description: string;
        questionCount: number;
        createdAt: string;
    }>;
    resources: Array<{
        id: string;
        title: string;
        description: string;
        fileUrl: string;
        uploadDate: string;
    }>;
    deadlines: Array<{
        id: string;
        title: string;
        type: string;
        dueDate: string;
        user: {
            name: string;
        };
    }>;
}

const AdminContent: React.FC = () => {
    const [content, setContent] = useState<Content>({
        quizzes: [],
        resources: [],
        deadlines: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/adminRoutes/content', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContent(response.data);
            } catch (error) {
                console.error('Error fetching content:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login/admin');
                }
            }
        };

        fetchContent();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Content Management</h1>
            </div>
            <div className="content-section">
                <h2>Quizzes</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Questions</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content.quizzes.map(quiz => (
                            <tr key={quiz.id}>
                                <td>{quiz.title}</td>
                                <td>{quiz.description}</td>
                                <td>{quiz.questionCount}</td>
                                <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-button">Edit</button>
                                    <button className="action-button delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2>Resources</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>File URL</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content.resources.map(resource => (
                            <tr key={resource.id}>
                                <td>{resource.title}</td>
                                <td>{resource.description}</td>
                                <td>{resource.fileUrl}</td>
                                <td>{new Date(resource.uploadDate).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-button">Edit</button>
                                    <button className="action-button delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h2>Upcoming Deadlines</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Due Date</th>
                            <th>User</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {content.deadlines.map(deadline => (
                            <tr key={deadline.id}>
                                <td>{deadline.title}</td>
                                <td>{deadline.type}</td>
                                <td>{new Date(deadline.dueDate).toLocaleDateString()}</td>
                                <td>{deadline.user.name}</td>
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

export default AdminContent; 
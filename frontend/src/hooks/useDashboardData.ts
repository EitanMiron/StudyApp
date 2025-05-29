import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    totalResources: number;
    enrolledGroups: number;
    completedQuizzes: number;
    totalNotes: number;
    upcomingDeadlines: Array<{
        id: string;
        title: string;
        type: string;
        dueDate: string;
    }>;
}

export const useDashboardData = () => {
    const [stats, setStats] = useState<DashboardStats>({
        enrolledGroups: 0,
        completedQuizzes: 0,
        totalNotes: 0,
        totalResources: 0,
        upcomingDeadlines: []
    });
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/userRoutes/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login/user');
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return { stats, fetchDashboardData };
}; 
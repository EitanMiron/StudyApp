import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export interface Deadline {
    _id: string;
    title: string;
    description?: string;
    type: string;
    dueDate: string;
    priority?: string;
    status?: string;
    isCompleted?: boolean;
}

interface DashboardStats {
    totalResources: number;
    enrolledGroups: number;
    completedQuizzes: number;
    totalNotes: number;
    upcomingDeadlines: Deadline[];
    allDeadlines: Deadline[];
}

// Create a shared state outside the hook
let sharedStats: DashboardStats = {
    enrolledGroups: 0,
    completedQuizzes: 0,
    totalNotes: 0,
    totalResources: 0,
    upcomingDeadlines: [],
    allDeadlines: []
};

// Create a list of setState functions to update
const stateUpdaters: Array<React.Dispatch<React.SetStateAction<DashboardStats>>> = [];

export const useDashboardData = () => {
    const [stats, setStats] = useState<DashboardStats>(sharedStats);
    const navigate = useNavigate();

    // Add this component's setState to the list of updaters
    useEffect(() => {
        stateUpdaters.push(setStats);
        return () => {
            const index = stateUpdaters.indexOf(setStats);
            if (index > -1) {
                stateUpdaters.splice(index, 1);
            }
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login/user');
                return;
            }
            // Fetch dashboard stats (for enrolledGroups, quizzes, etc.)
            const dashRes = await axios.get('/api/userRoutes/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Fetch all deadlines
            const deadlinesRes = await axios.get('/api/userRoutes/deadlines', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allDeadlines = deadlinesRes.data;
            // Update shared state
            sharedStats = { ...dashRes.data, allDeadlines };
            stateUpdaters.forEach(updater => updater(sharedStats));
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('email');
                navigate('/login/user');
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return { stats, fetchDashboardData };
}; 

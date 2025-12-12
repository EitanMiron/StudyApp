import React, { createContext, useContext, ReactNode } from 'react';
import axios from 'axios';

interface DashboardContextType {
    fetchDashboardData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch user stats
            const statsResponse = await axios.get('/api/userRoutes/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // You can store the stats in local state or use a state management solution
            // For now, we'll just ensure the data is fetched successfully
            console.log('Dashboard data fetched:', statsResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };

    return (
        <DashboardContext.Provider value={{ fetchDashboardData }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardData = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboardData must be used within a DashboardProvider');
    }
    return context;
}; 

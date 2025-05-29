import { JSX } from '@emotion/react/jsx-runtime';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
  role?: 'admin' | 'user'; // Optional role-based protection
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login/user" replace />;
  }

  return children;
};

export default ProtectedRoute;

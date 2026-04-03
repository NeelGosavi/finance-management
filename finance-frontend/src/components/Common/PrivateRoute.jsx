import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, isTeacher, isStudent, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Загрузка...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === 'teacher' && !isTeacher()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireRole === 'student' && !isStudent()) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
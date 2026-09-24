import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Skeleton';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If user's role is not authorized for this route, redirect to their role dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

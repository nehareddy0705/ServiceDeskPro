import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('servicedesk_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('servicedesk_token');
      if (token) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch (err) {
          console.error('Session validation error:', err);
          setUser(null);
          localStorage.removeItem('servicedesk_token');
          localStorage.removeItem('servicedesk_user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser, token } = await authService.login({ email, password });
    setUser(loggedInUser);
    return { user: loggedInUser, token };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      return freshUser;
    } catch {
      return user;
    }
  };

  const role = user?.role || null;
  const isEmployee = role === 'employee';
  const isTechnician = role === 'technician';
  const isManager = role === 'it_manager';
  const isAssetManager = role === 'asset_manager';
  const isAdmin = role === 'system_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user,
        isEmployee,
        isTechnician,
        isManager,
        isAssetManager,
        isAdmin,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

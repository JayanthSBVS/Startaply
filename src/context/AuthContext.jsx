import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('strataply_token');
    const storedUser = localStorage.getItem('strataply_user');
    
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('strataply_token', token);
    localStorage.setItem('strataply_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('strataply_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Session close error:', err);
    }
    localStorage.removeItem('strataply_token');
    localStorage.removeItem('strataply_user');
    setUser(null);
  };

  const isManager = () => user?.role === 'manager';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isManager }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

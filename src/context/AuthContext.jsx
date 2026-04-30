import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Role normalization — mirrors the server-side helper
const normalizeRole = (role) => {
  if (!role) return 'executive';
  if (role === 'admin') return 'executive';
  return role;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  // permissions: array of role_permissions rows from DB
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('strataply_token');
    const storedUser  = localStorage.getItem('strataply_user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        parsed.role = normalizeRole(parsed.role);
        setUser(parsed);
        // Fetch permissions in background — non-blocking
        fetchPermissions(storedToken).catch(() => {});
      } catch { /* corrupt storage — ignore */ }
    }
    setLoading(false);
  }, []);

  // Fetch role permissions from server
  const fetchPermissions = async (token) => {
    try {
      const t = token || localStorage.getItem('strataply_token');
      if (!t) return;
      const res = await axios.get('/api/auth/permissions', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (Array.isArray(res.data)) {
        setPermissions(res.data);
      }
    } catch (err) {
      // Non-fatal: permissions will fall back to defaults
      console.warn('[Permissions fetch failed]', err?.response?.status);
    }
  };

  const login = (token, userData) => {
    const normalizedUser = { ...userData, role: normalizeRole(userData.role) };
    localStorage.setItem('strataply_token', token);
    localStorage.setItem('strataply_user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    // Fetch permissions right after login
    fetchPermissions(token).catch(() => {});
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('strataply_token');
      if (token) {
        const apiUrl = window.location.origin + '/api/auth/logout';
        await fetch(apiUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Session close error:', err);
    }
    localStorage.removeItem('strataply_token');
    localStorage.removeItem('strataply_user');
    setUser(null);
    setPermissions([]);
  };

  // ── ROLE HELPERS ────────────────────────────────────────────────────────────
  const isManager   = () => user?.role === 'manager';
  const isOpManager = () => user?.role === 'operational_manager';
  const isExecutive = () => user?.role === 'executive' || user?.role === 'admin';

  // Get the permissions row for the current user's role
  const getMyPermissions = useCallback(() => {
    if (!user) return {};
    if (isManager()) {
      // Managers always have full access
      return {
        can_post_job: true, can_edit_job: true, can_delete_job: true,
        can_view_applicants: true, can_manage_companies: true,
        can_manage_mela: true, can_manage_prep: true
      };
    }
    const myRole = normalizeRole(user.role);
    const row = permissions.find(p => p.role === myRole);
    // Defaults if not loaded yet
    return row || {
      can_post_job: true, can_edit_job: true, can_delete_job: false,
      can_view_applicants: true, can_manage_companies: true,
      can_manage_mela: true, can_manage_prep: true
    };
  }, [user, permissions]);

  // Check a specific permission flag for the current user
  // e.g. canDo('can_post_job')
  const canDo = useCallback((action) => {
    if (!user) return false;
    if (isManager()) return true; // Manager bypasses all
    const perms = getMyPermissions();
    return perms[action] !== false; // Default allow if key missing
  }, [user, permissions]);

  // Refresh permissions from server (call after manager updates them)
  const refreshPermissions = () => fetchPermissions().catch(() => {});

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      // Role checks
      isManager, isOpManager, isExecutive,
      // Permission checks
      permissions, getMyPermissions, canDo, refreshPermissions,
      // Expose raw fetchPermissions for advanced usage
      fetchPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

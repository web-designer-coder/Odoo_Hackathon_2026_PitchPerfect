import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios
  axios.defaults.baseURL = 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;

  // Restore token from localStorage on mount and verify with /auth/me
  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('dayflow_user');
      const savedToken = localStorage.getItem('dayflow_token');
      if (savedUser && savedToken) {
        // Set header immediately so subsequent calls work
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        setUser(JSON.parse(savedUser));
        setLoading(false);
        // Silently re-verify and refresh user data in background
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('dayflow_user', JSON.stringify(res.data));
        } catch {
          // Token expired — clear
          localStorage.removeItem('dayflow_user');
          localStorage.removeItem('dayflow_token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        try {
          const res = await axios.get('/auth/me');
          setUser(res.data);
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem('dayflow_user', JSON.stringify(userData));
    localStorage.setItem('dayflow_token', userData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    return userData;
  };

  const logout = async () => {
    try { await axios.post('/auth/logout'); } catch {}
    setUser(null);
    localStorage.removeItem('dayflow_user');
    localStorage.removeItem('dayflow_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Allow other components to refresh current user from DB
  const refreshUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('dayflow_user', JSON.stringify(res.data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

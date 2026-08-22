import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * OAuth Callback Handler
 * After Google/Microsoft OAuth, the backend redirects here with ?token=...&role=...
 * This page saves the token and redirects to the correct dashboard.
 */
const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Set the token in axios and fetch user data
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/auth/me').then(res => {
        const userData = { ...res.data, token };
        localStorage.setItem('dayflow_user', JSON.stringify(userData));
        localStorage.setItem('dayflow_token', token);
        const dest = (userData.role === 'admin' || userData.role === 'hr') ? '/admin' : '/app';
        navigate(dest, { replace: true });
      }).catch(() => {
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center">
      <p className="font-mono text-sm text-muted">Completing sign-in...</p>
    </div>
  );
};

export default OAuthCallback;

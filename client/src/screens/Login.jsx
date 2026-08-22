import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SocialDivider = () => (
  <div className="flex items-center gap-4 my-2">
    <div className="flex-1 border-b border-border"></div>
    <span className="font-mono text-xs text-muted tracking-widest">OR</span>
    <div className="flex-1 border-b border-border"></div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam) {
      setError(decodeURIComponent(errParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      const userData = await login(email, password);
      if (userData.role === 'admin' || userData.role === 'hr') navigate('/admin');
      else navigate('/app');
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        const targetEmail = err.response.data.email || email;
        setVerifyEmail(targetEmail);
        setShowVerifyModal(true);
        handleSendOTP(targetEmail);
      } else {
        setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (targetEmail) => {
    const emailToUse = targetEmail || verifyEmail;
    setLoading(true);
    setVerifyMsg('');
    try {
      await axios.post('/auth/send-otp', { email: emailToUse });
      setVerifyMsg(`OTP verification code sent to ${emailToUse}`);
    } catch (err) {
      setVerifyMsg(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerifyMsg('');
    try {
      const res = await axios.post('/auth/verify-email', { email: verifyEmail, code: verifyCode });
      const userData = res.data.user;
      const token = res.data.token;
      localStorage.setItem('dayflow_user', JSON.stringify({ ...userData, token }));
      localStorage.setItem('dayflow_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setShowVerifyModal(false);
      window.location.href = userData.role === 'admin' || userData.role === 'hr' ? '/admin' : '/app';
    } catch (err) {
      setVerifyMsg(err.response?.data?.message || 'Invalid OTP code. Enter valid OTP or demo code: 123456');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGitHubAuth = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <div className="min-h-screen bg-background text-primary flex items-center justify-center p-8 selection:bg-surface-200">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-10">
          <h1 className="font-sora font-semibold text-2xl tracking-widest mb-2">DAYFLOW</h1>
          <p className="font-mono text-xs text-muted tracking-widest uppercase">Sign In</p>
        </div>

        {/* Social OAuth Buttons */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3 border border-border text-sm font-mono text-primary hover:border-primary hover:bg-surface-50 transition-colors flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleGitHubAuth}
            className="w-full py-3 border border-border text-sm font-mono text-primary hover:border-primary hover:bg-surface-50 transition-colors flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <SocialDivider />

        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          {error && (
            <div className="p-4 border border-red-900/50 bg-red-950/20 text-red-400 font-mono text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button type="submit" disabled={loading}
              className="w-full py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => navigate('/signup')}
              className="w-full py-3 text-sm font-mono text-muted hover:text-primary transition-colors uppercase tracking-wider cursor-pointer">
              Create Account
            </button>
          </div>
        </form>

        {/* Verification Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-surface-50 border border-border p-8 max-w-md w-full space-y-6">
              <h2 className="font-sora text-xl font-light">Email OTP Verification</h2>
              <p className="font-mono text-xs text-muted">
                Enter your 6-digit OTP code sent to <span className="text-primary font-semibold">{verifyEmail}</span>.
                <br />
                <span className="text-muted">(Or enter demo code: <span className="text-primary">123456</span>)</span>
              </p>

              {verifyMsg && (
                <div className="p-3 border border-primary/50 bg-primary/10 text-primary font-mono text-xs">
                  {verifyMsg}
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-secondary tracking-widest uppercase mb-2">6-Digit OTP Code</label>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-background border border-border p-3 text-center text-2xl font-mono tracking-widest text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => handleSendOTP(verifyEmail)}
                    disabled={loading}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Send / Resend OTP
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 border border-primary bg-primary text-background font-mono text-sm hover:bg-background hover:text-primary transition-colors uppercase cursor-pointer">
                    Verify & Sign In
                  </button>
                  <button type="button" onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-3 border border-border font-mono text-sm text-muted hover:text-primary transition-colors uppercase cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;

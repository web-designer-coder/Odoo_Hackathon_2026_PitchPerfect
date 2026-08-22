import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const SocialDivider = () => (
  <div className="flex items-center gap-4 my-2">
    <div className="flex-1 border-b border-border"></div>
    <span className="font-mono text-xs text-muted tracking-widest">OR</span>
    <div className="flex-1 border-b border-border"></div>
  </div>
);

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', employeeId: '', email: '', password: '', role: 'employee',
    phone: '', address: '', department: 'Engineering', jobTitle: 'Software Engineer'
  });

  const [otpCode, setOtpCode] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [userRole, setUserRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOtpNotice('');
    try {
      const res = await axios.post('/auth/register', formData);
      const registeredUser = res.data?.user;

      if (registeredUser) {
        setUserRole(registeredUser.role || formData.role);
      }
      setOtpNotice(`OTP verification code sent to ${formData.email}`);
      setStep(1.5);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('/auth/send-otp', { email: formData.email });
      setOtpNotice(`New OTP verification code sent to ${formData.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/auth/verify-email', { email: formData.email, code: otpCode });
      const token = res.data.token;
      const verifiedUser = res.data.user;

      if (token && verifiedUser) {
        localStorage.setItem('dayflow_token', token);
        localStorage.setItem('dayflow_user', JSON.stringify(verifiedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Enter valid OTP or demo code: 123456');
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

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put('/employees/me', {
        phone: formData.phone,
        address: formData.address,
        department: formData.department,
        jobTitle: formData.jobTitle
      });
      window.location.href = userRole === 'admin' || userRole === 'hr' ? '/admin' : '/app';
    } catch (err) {
      window.location.href = userRole === 'admin' || userRole === 'hr' ? '/admin' : '/app';
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    window.location.href = userRole === 'admin' || userRole === 'hr' ? '/admin' : '/app';
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
          <p className="font-mono text-xs text-muted tracking-widest uppercase">
            {step === 1 ? 'Create Account' : step === 1.5 ? 'Email Verification Required' : 'Complete Employee Details'}
          </p>
        </div>

        {error && (
          <div className="p-4 border border-red-900/50 bg-red-950/20 text-red-400 font-mono text-sm mb-6">{error}</div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <>
            <div className="space-y-3 mb-6">
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

            <form onSubmit={handleStep1Submit} className="space-y-6 mt-6">
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="block font-mono text-xs text-secondary tracking-widest uppercase">First Name</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Last Name</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Employee ID</label>
                <input required type="text" name="employeeId" value={formData.employeeId} onChange={handleChange}
                  placeholder="e.g. EMP-005"
                  className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted" />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Role</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full bg-background border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors cursor-pointer">
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button type="submit" disabled={loading}
                  className="w-full py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer">
                  {loading ? 'Creating Account...' : 'Create Account & Verify OTP →'}
                </button>
                <button type="button" onClick={() => window.location.href = '/login'}
                  className="w-full py-3 text-sm font-mono text-muted hover:text-primary transition-colors uppercase tracking-wider cursor-pointer">
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 1.5: Email Verification OTP Screen */}
        {step === 1.5 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6 border border-border p-6 bg-surface-50">
            <h2 className="font-sora text-xl font-light">Verify Your Email OTP</h2>
            <p className="font-mono text-xs text-muted">
              Enter the 6-digit OTP code sent to <span className="text-primary font-semibold">{formData.email}</span>.
              <br />
              <span className="text-muted">(Or enter demo code: <span className="text-primary">123456</span>)</span>
            </p>

            {otpNotice && (
              <div className="p-3 border border-primary/50 bg-primary/10 text-primary font-mono text-xs">
                {otpNotice}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">6-Digit OTP Code</label>
              <input
                required
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-background border border-border p-3 text-center text-2xl font-mono tracking-widest text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-xs font-mono text-primary hover:underline cursor-pointer"
              >
                Send / Resend OTP
              </button>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 border border-primary bg-primary text-background font-mono text-sm hover:bg-background hover:text-primary transition-colors uppercase tracking-wider cursor-pointer"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Complete Employee Profile Details */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="p-4 border border-green-900/50 bg-green-950/20 text-green-400 font-mono text-xs">
              ✓ Email Verified! Complete your employee profile details below to finish setup.
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Department</label>
              <select name="department" value={formData.department} onChange={handleChange}
                className="w-full bg-background border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors cursor-pointer">
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Job Title</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                placeholder="e.g. Senior Developer"
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted" />
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted" />
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                placeholder="City, Country..."
                className="w-full bg-transparent border border-border p-3 text-primary font-mono text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted" />
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button type="submit" disabled={loading}
                className="w-full py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer">
                {loading ? 'Saving Details...' : 'Complete Registration'}
              </button>
              <button type="button" onClick={handleSkip}
                className="w-full py-3 text-sm font-mono text-muted hover:text-primary transition-colors uppercase tracking-wider cursor-pointer">
                Skip for now
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;

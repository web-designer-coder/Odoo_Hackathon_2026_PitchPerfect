import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Payroll from '../models/Payroll.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Helper for dynamic 6-digit random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to send email via Nodemailer if SMTP configured
const sendEmailOTP = async (email, otp) => {
  console.log(`\n======================================================`);
  console.log(` [DAYFLOW TERMINAL OTP LOG]`);
  console.log(` Email: ${email}`);
  console.log(` Verification OTP Code: ${otp}`);
  console.log(` (Or use Demo Code: 123456)`);
  console.log(`======================================================\n`);

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: `"Dayflow HRMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Dayflow HRMS — Your Verification OTP Code',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Dayflow Email Verification</h2>
          <p>Your 6-digit verification OTP code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 4px; color: #4285F4;">${otp}</h1>
          <p>This code is required to verify your Dayflow account.</p>
        </div>`
      });
      return true;
    } catch (err) {
      console.error('Nodemailer SMTP Error:', err.message);
      return false;
    }
  }
  return false;
};

// ─── Email/Password Auth ──────────────────────────────────────────────────────

// POST /api/auth/send-otp — Request or Resend Dynamic OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No user account found with this email' });
    }

    const otp = generateOTP();
    user.verificationCode = otp;
    await user.save();

    await sendEmailOTP(user.email, otp);

    res.json({
      message: `OTP verification code sent to ${user.email}`,
      otpSent: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { employeeId, email, password, role, firstName, lastName, phone, address, department, jobTitle } = req.body;
  try {
    if (!employeeId || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'First name, last name, employee ID, email, and password are required' });
    }
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or Employee ID already exists' });
    }
    const allowedRoles = ['employee', 'hr', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'employee';

    const verificationCode = generateOTP();

    const user = await User.create({
      employeeId,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      isEmailVerified: false,
      verificationCode,
      profile: {
        firstName,
        lastName,
        phone: phone || '',
        address: address || '',
        department: department || '',
        jobTitle: jobTitle || ''
      }
    });

    await Payroll.create({ user: user._id, baseSalary: 50000, allowances: 5000, deductions: 2000, paidLeaveLimit: 3 });

    await sendEmailOTP(user.email, verificationCode);
    const token = generateToken(user._id);

    res.status(201).json({
      message: `Verification OTP code sent to ${user.email}`,
      token,
      user: { id: user._id, employeeId: user.employeeId, email: user.email, role: user.role, profile: user.profile },
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and OTP verification code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (user.isEmailVerified) {
      const token = generateToken(user._id);
      return res.json({ message: 'Email already verified', token, user });
    }

    const inputCode = code.trim();
    const storedCode = (user.verificationCode || '').trim();

    // Verify against real generated OTP OR universal demo OTP 123456
    if ((storedCode && inputCode === storedCode) || inputCode === '123456') {
      user.isEmailVerified = true;
      user.verificationCode = '';
      await user.save();

      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: 'Email verified successfully!',
        token,
        user: { id: user._id, employeeId: user.employeeId, email: user.email, role: user.role, profile: user.profile }
      });
    } else {
      return res.status(400).json({ message: 'Invalid OTP code. Please enter valid OTP or demo code: 123456' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified && user.role !== 'admin') {
      return res.status(403).json({
        message: 'Email not verified. Please verify your email before signing in.',
        requiresVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({ id: user._id, employeeId: user.employeeId, email: user.email, role: user.role, profile: user.profile, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// ─── Real Google OAuth Flow ───────────────────────────────────────────────────

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.trim() === '') {
    return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent('Google OAuth Client ID is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env'));
  }
  const redirectUri = encodeURIComponent('http://localhost:5000/api/auth/google/callback');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect('http://localhost:5173/login?error=Google authentication was cancelled.');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5000/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent(tokenData.error_description || 'Failed to exchange Google OAuth code. Check client secret in server/.env'));
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return res.redirect('http://localhost:5173/login?error=Could not retrieve email from Google profile.');
    }

    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      const count = await User.countDocuments();
      const firstName = profile.given_name || profile.name?.split(' ')[0] || 'Google';
      const lastName = profile.family_name || profile.name?.split(' ')[1] || 'User';
      user = await User.create({
        employeeId: `GGL-${String(count + 1).padStart(3, '0')}`,
        email: profile.email.toLowerCase(),
        password: `google_oauth_${Date.now()}`,
        role: 'employee',
        isEmailVerified: true,
        profile: {
          firstName,
          lastName,
          avatar: profile.picture || '',
          department: 'Engineering',
          jobTitle: 'Software Engineer'
        }
      });
      await Payroll.create({ user: user._id, baseSalary: 55000, allowances: 5000, deductions: 2000, paidLeaveLimit: 3 });
    } else {
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.redirect(`http://localhost:5173/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
  }
});

// ─── Real GitHub OAuth Flow ────────────────────────────────────────────────────

router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || clientId.trim() === '') {
    return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent('GitHub OAuth Client ID is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env'));
  }
  const redirectUri = encodeURIComponent('http://localhost:5000/api/auth/github/callback');
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect('http://localhost:5173/login?error=GitHub authentication was cancelled.');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: 'http://localhost:5000/api/auth/github/callback'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent(tokenData.error_description || 'Failed to exchange GitHub OAuth code. Check GITHUB_CLIENT_SECRET in server/.env'));
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Dayflow-HRMS'
      }
    });
    const profile = await userRes.json();

    let userEmail = profile.email;
    if (!userEmail) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Dayflow-HRMS'
        }
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails) && emails.length > 0) {
        const primary = emails.find(e => e.primary && e.verified) || emails[0];
        userEmail = primary.email;
      }
    }

    if (!userEmail) {
      return res.redirect('http://localhost:5173/login?error=Could not retrieve a verified email address from your GitHub account.');
    }

    userEmail = userEmail.toLowerCase();
    const nameParts = (profile.name || profile.login || 'GitHub User').trim().split(' ');
    const firstName = nameParts[0] || 'GitHub';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    let user = await User.findOne({ email: userEmail });
    if (!user) {
      const count = await User.countDocuments();
      user = await User.create({
        employeeId: `GH-${String(count + 1).padStart(3, '0')}`,
        email: userEmail,
        password: `github_oauth_${Date.now()}`,
        role: 'employee',
        isEmailVerified: true,
        profile: {
          firstName,
          lastName,
          avatar: profile.avatar_url || '',
          department: 'Engineering',
          jobTitle: 'Software Engineer'
        }
      });
      await Payroll.create({ user: user._id, baseSalary: 55000, allowances: 5000, deductions: 2000, paidLeaveLimit: 3 });
    } else {
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.redirect(`http://localhost:5173/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
  }
});

export default router;

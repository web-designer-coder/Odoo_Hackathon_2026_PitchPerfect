// DNS override MUST be first — fixes Cloudflare Family DNS blocking MongoDB SRV records
import './config/dns.js';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dayflow-session',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGODB_URI is not set in .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => console.log('MongoDB Atlas Connected ✓'))
  .catch(err => {
    console.error('\n======================================================');
    console.error(' [MONGODB ATLAS CONNECTION ERROR]');
    console.error(' Cause:', err.message);
    console.error(' Action Required: Whitelist your current IP in MongoDB Atlas!');
    console.error(' Go to cloud.mongodb.com -> Network Access -> Add IP Address -> 0.0.0.0/0');
    console.error('======================================================\n');
  });

// Database connectivity middleware to prevent 10s buffering timeouts when IP is blocked
app.use((req, res, next) => {
  if (req.path === '/' || req.path.startsWith('/api/auth/google') || req.path.startsWith('/api/auth/github')) {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'MongoDB Connection Error: Your IP is not whitelisted in MongoDB Atlas. Go to cloud.mongodb.com -> Network Access -> Add IP Address (0.0.0.0/0).'
    });
  }
  next();
});

app.get('/', (req, res) => res.send('Dayflow HRMS API running'));

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import payrollRoutes from './routes/payroll.js';
import notificationRoutes from './routes/notifications.js';

app.use('/api/auth', authRoutes);
app.use('/api/employees', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

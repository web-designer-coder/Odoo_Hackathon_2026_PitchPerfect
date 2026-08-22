/**
 * DAYFLOW — Development Seed Script
 * ====================================
 * Run ONLY for development/testing:
 *   npm run seed
 *
 * This script is SAFE — it uses upsert (findOneAndUpdate with upsert:true)
 * so it will NOT delete existing production data.
 * It creates the test accounts only if they don't already exist.
 */
import './config/dns.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Payroll from './models/Payroll.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow';

const seedUsers = [
  {
    employeeId: 'ADM-001',
    email: 'admin@dayflow.com',
    password: 'password123',
    role: 'admin',
    profile: { firstName: 'System', lastName: 'Admin', department: 'HR', jobTitle: 'HR Administrator' }
  },
  {
    employeeId: 'HR-001',
    email: 'hr@dayflow.com',
    password: 'password123',
    role: 'hr',
    profile: { firstName: 'HR', lastName: 'Manager', department: 'HR', jobTitle: 'HR Manager' }
  },
  {
    employeeId: 'EMP-001',
    email: 'employee@dayflow.com',
    password: 'password123',
    role: 'employee',
    profile: { firstName: 'John', lastName: 'Doe', department: 'Engineering', jobTitle: 'Software Engineer' }
  },
  {
    employeeId: 'EMP-002',
    email: 'jane@dayflow.com',
    password: 'password123',
    role: 'employee',
    profile: { firstName: 'Jane', lastName: 'Smith', department: 'Design', jobTitle: 'UI Designer' }
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);
    console.log('Seeding development accounts (upsert — existing data is safe)...\n');

    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`  ✓ Already exists: ${userData.email} (skipped)`);
        continue;
      }
      const user = await User.create(userData);
      // Create payroll record if not exists
      const existingPayroll = await Payroll.findOne({ user: user._id });
      if (!existingPayroll) {
        await Payroll.create({ user: user._id, baseSalary: userData.role === 'admin' ? 0 : 50000, allowances: 5000, deductions: 2000 });
      }
      console.log(`  ✓ Created: ${userData.email} (${userData.role})`);
    }

    console.log('\nSeed complete.');
    console.log('\nTest Credentials:');
    console.log('  Admin:    admin@dayflow.com   / password123');
    console.log('  HR:       hr@dayflow.com      / password123');
    console.log('  Employee: employee@dayflow.com / password123');
    console.log('  Employee: jane@dayflow.com     / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

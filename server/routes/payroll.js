import express from 'express';
import Payroll from '../models/Payroll.js';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const adminOrHr = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hr')) return next();
  res.status(403).json({ message: 'Not authorized' });
};

// Helper to calculate dynamic payroll details with unpaid leave deductions
const calculatePayrollDetails = async (userId) => {
  let payroll = await Payroll.findOne({ user: userId });
  if (!payroll) {
    payroll = await Payroll.create({
      user: userId,
      baseSalary: 50000,
      allowances: 5000,
      deductions: 2000,
      paidLeaveLimit: 3
    });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Find all approved unpaid leaves for the current month
  const unpaidLeaves = await LeaveRequest.find({
    user: userId,
    category: 'Unpaid',
    status: 'Approved',
    startDate: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const unpaidDays = unpaidLeaves.reduce((acc, l) => acc + (l.daysCount || 1), 0);
  const dailyRate = Math.round((payroll.baseSalary || 50000) / 30);
  const unpaidDeductions = Math.round(unpaidDays * dailyRate);
  const totalDeductions = (payroll.deductions || 0) + unpaidDeductions;
  const netSalary = Math.max(0, (payroll.baseSalary || 0) + (payroll.allowances || 0) - totalDeductions);

  return {
    _id: payroll._id,
    user: payroll.user,
    baseSalary: payroll.baseSalary,
    allowances: payroll.allowances,
    deductions: payroll.deductions,
    paidLeaveLimit: payroll.paidLeaveLimit,
    dailyRate,
    unpaidDays,
    unpaidDeductions,
    totalDeductions,
    netSalary,
    effectiveDate: payroll.effectiveDate
  };
};

// GET /api/payroll/me — Get logged in user's dynamic payroll details
router.get('/me', protect, async (req, res) => {
  try {
    const details = await calculatePayrollDetails(req.user._id);
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payroll/slip/me — Get official Salary Slip for logged in user
router.get('/slip/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const details = await calculatePayrollDetails(req.user._id);
    const slip = {
      payPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      generatedAt: new Date(),
      employee: {
        id: user.employeeId,
        name: `${user.profile?.firstName} ${user.profile?.lastName}`,
        email: user.email,
        department: user.profile?.department || 'Engineering',
        jobTitle: user.profile?.jobTitle || 'Software Engineer'
      },
      payroll: details
    };
    res.json(slip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payroll/slip/:userId — Admin/HR get salary slip for specific user
router.get('/slip/:userId', protect, adminOrHr, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const details = await calculatePayrollDetails(req.params.userId);
    const slip = {
      payPeriod: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      generatedAt: new Date(),
      employee: {
        id: user.employeeId,
        name: `${user.profile?.firstName} ${user.profile?.lastName}`,
        email: user.email,
        department: user.profile?.department || 'Engineering',
        jobTitle: user.profile?.jobTitle || 'Software Engineer'
      },
      payroll: details
    };
    res.json(slip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/payroll/admin/:userId — Admin update employee base salary/allowances/deductions
router.put('/admin/:userId', protect, adminOrHr, async (req, res) => {
  try {
    const { baseSalary, allowances, deductions, paidLeaveLimit } = req.body;
    let payroll = await Payroll.findOne({ user: req.params.userId });

    if (payroll) {
      if (baseSalary !== undefined) payroll.baseSalary = baseSalary;
      if (allowances !== undefined) payroll.allowances = allowances;
      if (deductions !== undefined) payroll.deductions = deductions;
      if (paidLeaveLimit !== undefined) payroll.paidLeaveLimit = paidLeaveLimit;
      payroll.effectiveDate = new Date();
      await payroll.save();
    } else {
      payroll = await Payroll.create({
        user: req.params.userId,
        baseSalary: baseSalary || 50000,
        allowances: allowances || 5000,
        deductions: deductions || 2000,
        paidLeaveLimit: paidLeaveLimit || 3
      });
    }

    const updatedDetails = await calculatePayrollDetails(req.params.userId);
    res.json(updatedDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

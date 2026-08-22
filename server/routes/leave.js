import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import Payroll from '../models/Payroll.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const adminOrHr = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hr')) return next();
  res.status(403).json({ message: 'Not authorized' });
};

// Helper to calculate days between dates
const getDaysBetween = (start, end, duration) => {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return duration === 'Half-day' ? 0.5 : diffDays;
};

// GET /api/leave/balance — Get employee paid leave balance for current month
router.get('/balance', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findOne({ user: req.user._id });
    const limit = payroll?.paidLeaveLimit || 3;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const approvedPaidLeaves = await LeaveRequest.find({
      user: req.user._id,
      category: 'Paid',
      status: 'Approved',
      startDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const used = approvedPaidLeaves.reduce((acc, l) => acc + (l.daysCount || 1), 0);
    const remaining = Math.max(0, limit - used);

    res.json({ limit, used, remaining });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leave — apply for leave
router.post('/', protect, async (req, res) => {
  try {
    const { duration = 'Full-day', startDate, endDate, remarks } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    const daysCount = getDaysBetween(startDate, endDate, duration);

    // Calculate current month's paid leave balance
    const payroll = await Payroll.findOne({ user: req.user._id });
    const limit = payroll?.paidLeaveLimit || 3;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const approvedPaidLeaves = await LeaveRequest.find({
      user: req.user._id,
      category: 'Paid',
      status: 'Approved',
      startDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const usedPaidDays = approvedPaidLeaves.reduce((acc, l) => acc + (l.daysCount || 1), 0);
    const remainingPaidDays = Math.max(0, limit - usedPaidDays);

    // Automatically set category to Unpaid if paid limit exhausted
    let category = 'Paid';
    if (remainingPaidDays <= 0) {
      category = 'Unpaid';
    }

    const leave = await LeaveRequest.create({
      user: req.user._id,
      duration,
      type: `${category} (${duration})`,
      category,
      daysCount,
      startDate,
      endDate,
      remarks: remarks || ''
    });

    // Notify Admin/HR
    await Notification.create({
      user: req.user._id,
      title: 'New Leave Request',
      message: `${req.user.profile?.firstName} applied for ${duration} ${category} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
      type: 'Leave'
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leave/me — my leaves
router.get('/me', protect, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leave/admin — all leaves (admin/hr)
router.get('/admin', protect, adminOrHr, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('user', 'profile employeeId email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/leave/admin/:id/approve
router.patch('/admin/:id/approve', protect, adminOrHr, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    leave.status = 'Approved';
    leave.adminComments = req.body.comments || '';
    await leave.save();

    await Notification.create({
      user: leave.user,
      title: 'Leave Approved',
      message: `Your ${leave.duration} ${leave.category} leave request from ${new Date(leave.startDate).toDateString()} has been approved.`,
      type: 'Leave'
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/leave/admin/:id/reject
router.patch('/admin/:id/reject', protect, adminOrHr, async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    leave.status = 'Rejected';
    leave.adminComments = req.body.comments || '';
    await leave.save();

    await Notification.create({
      user: leave.user,
      title: 'Leave Rejected',
      message: `Your leave request from ${new Date(leave.startDate).toDateString()} was rejected. ${leave.adminComments}`,
      type: 'Leave'
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

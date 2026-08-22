import express from 'express';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const adminOrHr = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hr')) return next();
  res.status(403).json({ message: 'Not authorized' });
};

// POST /api/attendance/check-in
router.post('/check-in', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ user: req.user._id, date: today });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user._id, date: today },
      { checkIn: new Date(), status: 'Present' },
      { new: true, upsert: true }
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/attendance/check-out
router.post('/check-out', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Cannot check out before checking in' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const duration = (checkOutTime - attendance.checkIn) / (1000 * 60 * 60); // hours

    attendance.checkOut = checkOutTime;
    attendance.workDurationHours = Number(duration.toFixed(2));

    if (duration < 4) {
      attendance.status = 'Half-day';
    } else {
      attendance.status = 'Present';
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/me — Get logged in user attendance
router.get('/me', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/admin — Get real workforce attendance cross-referenced with leaves
router.get('/admin', protect, adminOrHr, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const users = await User.find({ role: { $in: ['employee', 'hr'] } }).select('-password');
    const attendanceRecords = await Attendance.find({ date: { $gte: today, $lte: endToday } }).populate('user', 'profile employeeId email');
    const activeLeaves = await LeaveRequest.find({
      status: 'Approved',
      startDate: { $lte: endToday },
      endDate: { $gte: today }
    });

    const statusMap = {};
    attendanceRecords.forEach(att => {
      if (att.user?._id) statusMap[att.user._id.toString()] = att;
    });

    const leaveMap = {};
    activeLeaves.forEach(l => {
      if (l.user) leaveMap[l.user.toString()] = l;
    });

    const liveWorkforceStatus = users.map(user => {
      const uId = user._id.toString();
      const attRecord = statusMap[uId];
      const leaveRecord = leaveMap[uId];

      let realStatus = 'Absent';
      if (attRecord) {
        realStatus = attRecord.status || (attRecord.workDurationHours < 4 ? 'Half-day' : 'Present');
      } else if (leaveRecord) {
        realStatus = leaveRecord.duration === 'Half-day' ? 'Half-day' : 'Leave';
      }

      return {
        _id: attRecord?._id || user._id,
        user: {
          _id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          profile: user.profile
        },
        date: today,
        checkIn: attRecord?.checkIn || null,
        checkOut: attRecord?.checkOut || null,
        workDurationHours: attRecord?.workDurationHours || 0,
        status: realStatus,
        leaveDetails: leaveRecord ? { type: leaveRecord.type, duration: leaveRecord.duration } : null
      };
    });

    res.json(liveWorkforceStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

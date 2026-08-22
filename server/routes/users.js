import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const adminOrHr = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hr')) return next();
  res.status(403).json({ message: 'Not authorized' });
};

// GET /api/employees/admin — get all employees (admin/hr)
router.get('/admin', protect, adminOrHr, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['employee', 'hr'] } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/employees/me — get own profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/employees/me — Employee update own editable fields ONLY (phone, address, avatar)
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // STRICT ACCESS CONTROL: Employee can edit ONLY phone, address, and profile picture (avatar)
    if (req.body.phone !== undefined) user.profile.phone = req.body.phone;
    if (req.body.address !== undefined) user.profile.address = req.body.address;
    if (req.body.avatar !== undefined) user.profile.avatar = req.body.avatar;

    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/employees/admin/:id — Admin/HR update ANY employee details
router.put('/admin/:id', protect, adminOrHr, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, department, jobTitle, phone, address, avatar, role } = req.body;
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (department !== undefined) user.profile.department = department;
    if (jobTitle !== undefined) user.profile.jobTitle = jobTitle;
    if (phone !== undefined) user.profile.phone = phone;
    if (address !== undefined) user.profile.address = address;
    if (avatar !== undefined) user.profile.avatar = avatar;
    if (role && ['employee', 'hr', 'admin'].includes(role)) user.role = role;

    const updatedUser = await user.save();
    const userObj = updatedUser.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: String,
    enum: ['Full-day', 'Half-day'],
    default: 'Full-day'
  },
  type: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Sick', 'Paid (Full-day)', 'Paid (Half-day)', 'Unpaid (Full-day)', 'Unpaid (Half-day)'],
    default: 'Paid'
  },
  category: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Paid'
  },
  daysCount: {
    type: Number,
    default: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminComments: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('LeaveRequest', leaveRequestSchema);

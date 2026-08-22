import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  baseSalary: {
    type: Number,
    required: true,
    default: 50000
  },
  allowances: {
    type: Number,
    default: 5000
  },
  deductions: {
    type: Number,
    default: 2000
  },
  paidLeaveLimit: {
    type: Number,
    default: 3 // Max paid leaves allowed per month
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

payrollSchema.virtual('dailyRate').get(function() {
  return Math.round((this.baseSalary || 0) / 30);
});

payrollSchema.virtual('netSalary').get(function() {
  return (this.baseSalary || 0) + (this.allowances || 0) - (this.deductions || 0);
});

payrollSchema.set('toJSON', { virtuals: true });
payrollSchema.set('toObject', { virtuals: true });

export default mongoose.model('Payroll', payrollSchema);

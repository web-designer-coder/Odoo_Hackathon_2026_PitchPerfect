import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Printer, Download } from 'lucide-react';

const EmployeePayroll = () => {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSlip, setShowSlip] = useState(false);
  const [slipData, setSlipData] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await axios.get('/payroll/me');
        setPayroll(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPayroll();
  }, []);

  const handleOpenSlip = async () => {
    try {
      const res = await axios.get('/payroll/slip/me');
      setSlipData(res.data);
      setShowSlip(true);
    } catch (err) {
      console.error('Failed to load salary slip', err);
    }
  };

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading payroll details...</div>;

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-sora text-3xl font-light mb-2">My Payroll & Compensation</h1>
          <p className="font-mono text-muted text-sm">Dynamic salary structure & official paystubs from MongoDB Atlas</p>
        </div>
        {payroll && (
          <button
            onClick={handleOpenSlip}
            className="px-6 py-2 border border-primary bg-primary text-background font-mono text-sm hover:bg-background hover:text-primary transition-colors flex items-center gap-2 uppercase"
          >
            <FileText size={16} />
            View Salary Slip
          </button>
        )}
      </div>

      {!payroll ? (
        <div className="border border-border p-12 text-center font-mono text-sm text-muted">
          No payroll record found in MongoDB. Contact HR to set up your compensation.
        </div>
      ) : (
        <>
          {/* Main Compensation Overview Card */}
          <div className="border border-border p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-sora text-xl font-light">Current Monthly Cycle</h2>
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                Payday in {daysLeft} Days
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Base Salary</p>
                <p className="font-sora text-2xl font-light">₹{(payroll.baseSalary || 0).toLocaleString()}</p>
                <p className="font-mono text-[10px] text-muted">₹{payroll.dailyRate || Math.round((payroll.baseSalary||50000)/30)}/day</p>
              </div>

              <div>
                <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Allowances</p>
                <p className="font-sora text-2xl font-light text-green-400">+₹{(payroll.allowances || 0).toLocaleString()}</p>
                <p className="font-mono text-[10px] text-muted">HRA & Special</p>
              </div>

              <div>
                <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Standard Deductions</p>
                <p className="font-sora text-2xl font-light text-red-400">-₹{(payroll.deductions || 0).toLocaleString()}</p>
                <p className="font-mono text-[10px] text-muted">PF & Tax</p>
              </div>

              <div>
                <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Unpaid Leave Cut</p>
                <p className="font-sora text-2xl font-light text-yellow-400">-₹{(payroll.unpaidDeductions || 0).toLocaleString()}</p>
                <p className="font-mono text-[10px] text-muted">{payroll.unpaidDays || 0} unpaid days</p>
              </div>

              <div className="bg-surface-50 p-3 border border-border">
                <p className="font-mono text-xs text-primary tracking-widest uppercase mb-1">Net Take-Home</p>
                <p className="font-sora text-2xl font-semibold text-primary">₹{(payroll.netSalary || 0).toLocaleString()}</p>
                <p className="font-mono text-[10px] text-muted">Calculated from Atlas</p>
              </div>
            </div>
          </div>

          {/* Breakdown Notice */}
          <div className="border border-border p-6 space-y-2 font-mono text-xs text-muted">
            <h3 className="text-secondary font-mono text-xs uppercase tracking-widest mb-2">Salary Rules & Structure</h3>
            <p>• Monthly Paid Leave Quota: <span className="text-primary font-semibold">{payroll.paidLeaveLimit || 3} Paid Days/month</span>.</p>
            <p>• Unpaid Leave Deductions: Automatically calculated as <span className="text-primary font-semibold">₹{payroll.dailyRate || Math.round((payroll.baseSalary||50000)/30)} per unpaid day</span> based on approved leave records.</p>
            <p>• Source of Truth: All salary records are dynamically computed from your real MongoDB Atlas document.</p>
          </div>
        </>
      )}

      {/* Official Salary Slip Modal */}
      {showSlip && slipData && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:border-none print:p-0">
            {/* Slip Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h1 className="font-sora text-2xl font-semibold tracking-widest">DAYFLOW HRMS</h1>
                <p className="font-mono text-xs text-muted">Official Employee Salary Slip — {slipData.payPeriod}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-border hover:border-primary text-xs font-mono flex items-center gap-2 uppercase transition-colors print:hidden"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>

            {/* Employee Meta */}
            <div className="grid grid-cols-2 gap-4 border border-border p-4 bg-surface-50 font-mono text-xs">
              <div>
                <p className="text-muted">Employee Name:</p>
                <p className="font-semibold text-sm text-primary">{slipData.employee.name}</p>
              </div>
              <div>
                <p className="text-muted">Employee ID:</p>
                <p className="font-semibold text-sm text-primary">{slipData.employee.id}</p>
              </div>
              <div>
                <p className="text-muted">Department:</p>
                <p className="text-primary">{slipData.employee.department}</p>
              </div>
              <div>
                <p className="text-muted">Designation:</p>
                <p className="text-primary">{slipData.employee.jobTitle}</p>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div className="border border-border">
              <div className="grid grid-cols-2 bg-surface-100 p-3 border-b border-border font-mono text-xs font-semibold uppercase tracking-widest">
                <div>Earnings / Allowances</div>
                <div>Deductions & Adjustments</div>
              </div>

              <div className="grid grid-cols-2 p-4 font-mono text-xs gap-4">
                <div className="space-y-2 border-r border-border pr-4">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span>₹{slipData.payroll.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Allowances (HRA/Special):</span>
                    <span>+₹{slipData.payroll.allowances.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Gross Earnings:</span>
                    <span>₹{(slipData.payroll.baseSalary + slipData.payroll.allowances).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pl-2">
                  <div className="flex justify-between text-red-400">
                    <span>Standard Deductions (PF/Tax):</span>
                    <span>-₹{slipData.payroll.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400">
                    <span>Unpaid Leave ({slipData.payroll.unpaidDays} days):</span>
                    <span>-₹{slipData.payroll.unpaidDeductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total Deductions:</span>
                    <span>-₹{slipData.payroll.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Footer */}
              <div className="bg-surface-50 p-4 border-t border-border flex items-center justify-between font-mono">
                <span className="text-sm font-semibold uppercase tracking-wider">Net Salary Payable:</span>
                <span className="font-sora text-2xl font-bold text-primary">₹{slipData.payroll.netSalary.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border print:hidden">
              <button
                onClick={() => setShowSlip(false)}
                className="px-6 py-2 border border-border text-sm font-mono text-muted hover:text-primary transition-colors uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;

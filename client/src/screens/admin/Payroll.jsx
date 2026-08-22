import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Printer } from 'lucide-react';

const AdminPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ baseSalary: 50000, allowances: 5000, deductions: 2000, paidLeaveLimit: 3 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/employees/admin');
      setEmployees(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openEdit = async (emp) => {
    setEditing(emp);
    try {
      const res = await axios.get(`/payroll/slip/${emp._id}`);
      const p = res.data.payroll;
      setForm({
        baseSalary: p.baseSalary || 50000,
        allowances: p.allowances || 5000,
        deductions: p.deductions || 2000,
        paidLeaveLimit: p.paidLeaveLimit || 3
      });
    } catch {
      setForm({ baseSalary: 50000, allowances: 5000, deductions: 2000, paidLeaveLimit: 3 });
    }
  };

  const openSlipModal = async (emp) => {
    try {
      const res = await axios.get(`/payroll/slip/${emp._id}`);
      setSelectedSlip(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await axios.put(`/payroll/admin/${editing._id}`, form);
      setMsg(`Payroll structure updated for ${editing.profile?.firstName} ${editing.profile?.lastName} in MongoDB Atlas.`);
      setEditing(null);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading workforce payroll...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">Workforce Payroll & Salary Structures</h1>
        <p className="font-mono text-muted text-sm">Manage compensation, unpaid leave deductions, and generate official paystubs</p>
      </div>

      {msg && <div className="p-4 border border-border bg-surface-50 font-mono text-sm text-secondary">{msg}</div>}

      {editing && (
        <form onSubmit={handleSave} className="border border-border p-6 space-y-6">
          <h2 className="font-sora text-xl font-light">
            Edit Salary Structure — {editing.profile?.firstName} {editing.profile?.lastName} ({editing.employeeId})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Base Salary (₹)</label>
              <input type="number" min="0" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Allowances (₹)</label>
              <input type="number" min="0" value={form.allowances} onChange={e => setForm({ ...form, allowances: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Standard Deductions (₹)</label>
              <input type="number" min="0" value={form.deductions} onChange={e => setForm({ ...form, deductions: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Monthly Paid Leave Quota</label>
              <input type="number" min="0" max="30" value={form.paidLeaveLimit} onChange={e => setForm({ ...form, paidLeaveLimit: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="font-mono text-sm text-secondary">
            Estimated Daily Rate: <span className="text-primary font-semibold">₹{Math.round((form.baseSalary || 0) / 30)}/day</span> (applied to unpaid leave days)
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={saving}
              className="px-8 py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase disabled:opacity-50">
              {saving ? 'Saving Structure...' : 'Save Structure'}
            </button>
            <button type="button" onClick={() => setEditing(null)}
              className="px-8 py-3 border border-border text-sm font-mono text-muted hover:text-primary hover:border-primary transition-colors uppercase">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-border">
        <div className="grid grid-cols-5 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
          <div>Employee</div><div>Department</div><div>Employee ID</div><div>Salary Slip</div><div>Structure</div>
        </div>
        {employees.map(emp => (
          <div key={emp._id} className="grid grid-cols-5 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors items-center last:border-b-0">
            <div>{emp.profile?.firstName} {emp.profile?.lastName}</div>
            <div className="text-muted">{emp.profile?.department || 'Engineering'}</div>
            <div className="text-muted font-mono">{emp.employeeId}</div>
            <div>
              <button onClick={() => openSlipModal(emp)}
                className="px-3 py-1 border border-primary text-primary text-xs font-mono hover:bg-primary hover:text-background transition-colors flex items-center gap-1 uppercase">
                <FileText size={12} /> View Slip
              </button>
            </div>
            <div>
              <button onClick={() => openEdit(emp)}
                className="px-3 py-1 border border-border text-xs font-mono hover:border-primary hover:text-primary transition-colors uppercase">
                Edit Structure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Salary Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background border border-border max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:border-none print:p-0">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h1 className="font-sora text-2xl font-semibold tracking-widest">DAYFLOW HRMS</h1>
                <p className="font-mono text-xs text-muted">Official Employee Salary Slip — {selectedSlip.payPeriod}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-border hover:border-primary text-xs font-mono flex items-center gap-2 uppercase transition-colors print:hidden"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border border-border p-4 bg-surface-50 font-mono text-xs">
              <div>
                <p className="text-muted">Employee Name:</p>
                <p className="font-semibold text-sm text-primary">{selectedSlip.employee.name}</p>
              </div>
              <div>
                <p className="text-muted">Employee ID:</p>
                <p className="font-semibold text-sm text-primary">{selectedSlip.employee.id}</p>
              </div>
              <div>
                <p className="text-muted">Department:</p>
                <p className="text-primary">{selectedSlip.employee.department}</p>
              </div>
              <div>
                <p className="text-muted">Designation:</p>
                <p className="text-primary">{selectedSlip.employee.jobTitle}</p>
              </div>
            </div>

            <div className="border border-border">
              <div className="grid grid-cols-2 bg-surface-100 p-3 border-b border-border font-mono text-xs font-semibold uppercase tracking-widest">
                <div>Earnings / Allowances</div>
                <div>Deductions & Adjustments</div>
              </div>

              <div className="grid grid-cols-2 p-4 font-mono text-xs gap-4">
                <div className="space-y-2 border-r border-border pr-4">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span>₹{selectedSlip.payroll.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Allowances:</span>
                    <span>+₹{selectedSlip.payroll.allowances.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Gross Earnings:</span>
                    <span>₹{(selectedSlip.payroll.baseSalary + selectedSlip.payroll.allowances).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pl-2">
                  <div className="flex justify-between text-red-400">
                    <span>Standard Deductions:</span>
                    <span>-₹{selectedSlip.payroll.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400">
                    <span>Unpaid Leave ({selectedSlip.payroll.unpaidDays} days):</span>
                    <span>-₹{selectedSlip.payroll.unpaidDeductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>Total Deductions:</span>
                    <span>-₹{selectedSlip.payroll.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-50 p-4 border-t border-border flex items-center justify-between font-mono">
                <span className="text-sm font-semibold uppercase tracking-wider">Net Payable Salary:</span>
                <span className="font-sora text-2xl font-bold text-primary">₹{selectedSlip.payroll.netSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border print:hidden">
              <button
                onClick={() => setSelectedSlip(null)}
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

export default AdminPayroll;

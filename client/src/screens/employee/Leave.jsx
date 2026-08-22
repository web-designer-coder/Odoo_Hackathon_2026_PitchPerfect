import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const EmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ limit: 3, used: 0, remaining: 3 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ duration: 'Full-day', startDate: '', endDate: '', remarks: '' });
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [showForm, setShowForm] = useState(false);

  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchLeaveData = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        axios.get('/leave/me'),
        axios.get('/leave/balance')
      ]);
      setLeaves(leavesRes.data);
      setBalance(balanceRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaveData(); }, []);

  const openCalendar = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker();
      } else {
        ref.current.focus();
        ref.current.click();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setMsg({ text: 'Please select valid start and end dates', isError: true });
      return;
    }
    if (form.startDate < todayStr) {
      setMsg({ text: 'Start date cannot be in the past', isError: true });
      return;
    }
    if (form.endDate < form.startDate) {
      setMsg({ text: 'End date cannot be before start date', isError: true });
      return;
    }

    setSubmitting(true);
    setMsg({ text: '', isError: false });
    try {
      await axios.post('/leave', form);
      const isUnpaid = balance.remaining <= 0;
      const statusText = isUnpaid
        ? 'Paid leave limit reached! Request submitted as UNPAID LEAVE (will affect monthly salary).'
        : 'Leave request submitted successfully and saved to MongoDB Atlas!';

      setMsg({ text: statusText, isError: isUnpaid });
      setForm({ duration: 'Full-day', startDate: '', endDate: '', remarks: '' });
      setShowForm(false);
      await fetchLeaveData();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to submit leave request', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusColor = (s) => s === 'Approved' ? 'text-green-400' : s === 'Rejected' ? 'text-red-400' : 'text-yellow-400';

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading leaves...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-3xl font-light mb-2">Leave Management</h1>
          <p className="font-mono text-muted text-sm">Apply and track your leave requests</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Dynamic Paid Leave Remaining Counter Badge */}
          <div className="px-4 py-2 border border-border bg-surface-50 font-mono text-xs text-secondary">
            Paid leaves: <span className="font-semibold text-primary">{balance.remaining} remaining</span> ({balance.used}/{balance.limit} used)
          </div>
          <button onClick={() => { setShowForm(!showForm); setMsg({ text: '', isError: false }); }}
            className="px-6 py-2 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase">
            {showForm ? 'Cancel' : 'Apply Leave'}
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 border font-mono text-sm ${msg.isError ? 'border-yellow-900/50 bg-yellow-950/20 text-yellow-400' : 'border-green-900/50 bg-green-950/20 text-green-400'}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon size={20} className="text-primary" />
              <h2 className="font-sora text-xl font-light">New Leave Request</h2>
            </div>
            {balance.remaining <= 0 && (
              <span className="font-mono text-xs text-yellow-400 border border-yellow-800 px-3 py-1">
                Notice: Paid limit reached — this will be UNPAID LEAVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leave Duration (Full-day vs Half-day) */}
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase flex items-center gap-2">
                <Clock size={14} className="text-muted" />
                Leave Duration
              </label>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-background border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors cursor-pointer">
                <option value="Full-day">Full-day (1.0 day)</option>
                <option value="Half-day">Half-day (0.5 day)</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Start Date</label>
              <div className="relative flex items-center border-b border-border hover:border-primary transition-colors">
                <input
                  ref={startPickerRef}
                  required
                  type="date"
                  min={todayStr}
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-transparent py-2 text-primary font-mono focus:outline-none cursor-pointer text-sm"
                />
                <button
                  type="button"
                  onClick={() => openCalendar(startPickerRef)}
                  className="p-2 text-secondary hover:text-primary transition-colors"
                  title="Open Calendar Picker"
                >
                  <CalendarIcon size={18} />
                </button>
              </div>
              <p className="font-mono text-[10px] text-muted">Past dates disabled (min: {todayStr})</p>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">End Date</label>
              <div className="relative flex items-center border-b border-border hover:border-primary transition-colors">
                <input
                  ref={endPickerRef}
                  required
                  type="date"
                  min={form.startDate || todayStr}
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-transparent py-2 text-primary font-mono focus:outline-none cursor-pointer text-sm"
                />
                <button
                  type="button"
                  onClick={() => openCalendar(endPickerRef)}
                  className="p-2 text-secondary hover:text-primary transition-colors"
                  title="Open Calendar Picker"
                >
                  <CalendarIcon size={18} />
                </button>
              </div>
              <p className="font-mono text-[10px] text-muted">Past dates disabled (min: {form.startDate || todayStr})</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Remarks / Reason</label>
            <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={3}
              placeholder="State reason for leave..."
              className="w-full bg-transparent border border-border p-3 text-primary font-mono text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted" />
          </div>

          <button type="submit" disabled={submitting}
            className="px-8 py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase tracking-wider disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      <div>
        <h2 className="font-sora text-xl font-light mb-4">My Leave Requests</h2>
        {leaves.length === 0 ? (
          <div className="border border-border p-12 text-center font-mono text-sm text-muted">No leave requests yet.</div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-6 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
              <div>Type & Duration</div><div>From</div><div>To</div><div>Days</div><div>Status</div><div>Remarks</div>
            </div>
            {leaves.map((l, i) => (
              <div key={i} className="grid grid-cols-6 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors last:border-b-0 items-center">
                <div>
                  <div className="font-mono font-medium">{l.type || l.category}</div>
                  <div className="text-xs text-muted">{l.duration || 'Full-day'}</div>
                </div>
                <div className="text-muted">{formatDate(l.startDate)}</div>
                <div className="text-muted">{formatDate(l.endDate)}</div>
                <div className="text-muted font-mono">{l.daysCount || (l.duration === 'Half-day' ? 0.5 : 1)}d</div>
                <div className={statusColor(l.status)}>{l.status}</div>
                <div className="text-muted text-xs truncate">{l.adminComments || l.remarks || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeave;

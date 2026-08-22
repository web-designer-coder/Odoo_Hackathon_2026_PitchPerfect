import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    try {
      const [attRes, leaveRes, payRes] = await Promise.all([
        axios.get('/attendance/me'),
        axios.get('/leave/me'),
        axios.get('/payroll/me')
      ]);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setPayroll(payRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCheckIn = async () => {
    setActionLoading(true); setMsg('');
    try {
      await axios.post('/attendance/check-in');
      await fetchAll();
      setMsg('Checked in successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Check-in failed');
    } finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true); setMsg('');
    try {
      await axios.post('/attendance/check-out');
      await fetchAll();
      setMsg('Checked out successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Check-out failed');
    } finally { setActionLoading(false); }
  };

  const todayRecord = attendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());

  // Stats from real data
  const presentDays = attendance.filter(a => a.status === 'Present' || a.status === 'Half-day').length;
  const totalDays = attendance.length || 1;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);
  const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  // Days until end of month (payroll cycle)
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysUntilPayroll = Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="font-mono text-sm text-muted">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.profile?.firstName}
        </h1>
        <p className="font-mono text-muted text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {msg && (
        <div className="p-4 border border-border bg-surface-50 font-mono text-sm text-secondary">{msg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Workday Status */}
        <div className="border border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">Workday Status</h3>
            <div className="font-sora text-2xl font-light mb-1">
              {todayRecord ? (todayRecord.checkOut ? 'COMPLETED' : 'ACTIVE') : 'PENDING'}
            </div>
            <div className="font-mono text-sm text-muted">
              {todayRecord?.checkIn
                ? `In: ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Not checked in'}
            </div>
            {todayRecord?.checkOut && (
              <div className="font-mono text-sm text-muted">
                Out: {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <div className="mt-6">
            {!todayRecord?.checkIn ? (
              <button onClick={handleCheckIn} disabled={actionLoading}
                className="w-full py-2 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors disabled:opacity-50">
                CHECK IN
              </button>
            ) : !todayRecord?.checkOut ? (
              <button onClick={handleCheckOut} disabled={actionLoading}
                className="w-full py-2 border border-border text-sm font-mono hover:border-primary transition-colors disabled:opacity-50">
                CHECK OUT
              </button>
            ) : (
              <div className="w-full py-2 text-sm font-mono text-center text-muted border border-transparent">Done for today</div>
            )}
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="border border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">Attendance Rate</h3>
            <div className="font-sora text-4xl font-light">{attendanceRate}%</div>
            <div className="font-mono text-sm text-muted mt-2">{presentDays} Days Present</div>
          </div>
          <button onClick={() => navigate('/app/attendance')}
            className="text-left font-mono text-xs uppercase tracking-widest text-primary hover:text-secondary mt-6">
            View History →
          </button>
        </div>

        {/* Leave Balance */}
        <div className="border border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">Leave Requests</h3>
            <div className="font-sora text-4xl font-light">{String(pendingLeaves).padStart(2, '0')}</div>
            <div className="font-mono text-sm text-muted mt-2">Pending | {approvedLeaves} Approved</div>
          </div>
          <button onClick={() => navigate('/app/leave')}
            className="text-left font-mono text-xs uppercase tracking-widest text-primary hover:text-secondary mt-6">
            Apply Leave →
          </button>
        </div>

        {/* Payroll */}
        <div className="border border-border p-6 flex flex-col justify-between bg-surface-50">
          <div>
            <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">Payroll</h3>
            <div className="font-sora text-lg font-light text-muted">Next cycle in</div>
            <div className="font-mono text-2xl mt-2">{daysUntilPayroll} Days</div>
            {payroll && (
              <div className="font-mono text-xs text-muted mt-2">
                Net: ₹{((payroll.baseSalary + payroll.allowances - payroll.deductions) || 0).toLocaleString()}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/app/payroll')}
            className="text-left font-mono text-xs uppercase tracking-widest text-primary hover:text-secondary mt-6">
            View Details →
          </button>
        </div>
      </div>

      {/* Recent Attendance */}
      {attendance.length > 0 && (
        <div>
          <h2 className="font-sora text-xl font-light mb-4">Recent Attendance</h2>
          <div className="border border-border">
            <div className="grid grid-cols-4 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
              <div>Date</div><div>Check In</div><div>Check Out</div><div>Status</div>
            </div>
            {attendance.slice(0, 5).map((a, i) => (
              <div key={i} className="grid grid-cols-4 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors last:border-b-0">
                <div>{new Date(a.date).toLocaleDateString()}</div>
                <div className="text-muted">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                <div className="text-muted">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                <div className={a.status === 'Present' ? 'text-green-400' : a.status === 'Half-day' ? 'text-yellow-400' : 'text-muted'}>{a.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;

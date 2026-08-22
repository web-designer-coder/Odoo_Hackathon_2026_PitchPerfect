import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/attendance/me');
      setAttendance(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const todayRecord = attendance.find(a => new Date(a.date).toDateString() === new Date().toDateString());

  const handleCheckIn = async () => {
    setActionLoading(true); setMsg('');
    try {
      await axios.post('/attendance/check-in');
      await fetchAttendance();
      setMsg('Checked in successfully!');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  const handleCheckOut = async () => {
    setActionLoading(true); setMsg('');
    try {
      await axios.post('/attendance/check-out');
      await fetchAttendance();
      setMsg('Checked out successfully!');
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading attendance...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">Attendance</h1>
        <p className="font-mono text-muted text-sm">Your daily attendance records</p>
      </div>

      {/* Today's action */}
      <div className="border border-border p-6 flex items-center justify-between">
        <div>
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-2">Today</h3>
          <p className="font-sora text-xl font-light">
            {todayRecord ? (todayRecord.checkOut ? 'Completed' : 'Active') : 'Not Started'}
          </p>
          {todayRecord?.checkIn && (
            <p className="font-mono text-sm text-muted mt-1">
              In: {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {todayRecord.checkOut && ` — Out: ${new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          )}
          {msg && <p className="font-mono text-sm text-secondary mt-2">{msg}</p>}
        </div>
        <div className="flex gap-4">
          {!todayRecord?.checkIn ? (
            <button onClick={handleCheckIn} disabled={actionLoading}
              className="px-6 py-2 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors disabled:opacity-50">
              CHECK IN
            </button>
          ) : !todayRecord?.checkOut ? (
            <button onClick={handleCheckOut} disabled={actionLoading}
              className="px-6 py-2 border border-border text-sm font-mono hover:border-primary transition-colors disabled:opacity-50">
              CHECK OUT
            </button>
          ) : (
            <span className="font-mono text-sm text-muted">Done for today</span>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="font-sora text-xl font-light mb-4">Attendance History</h2>
        {attendance.length === 0 ? (
          <div className="border border-border p-12 text-center font-mono text-sm text-muted">No records yet.</div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-5 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
              <div>Date</div><div>Check In</div><div>Check Out</div><div>Hours</div><div>Status</div>
            </div>
            {attendance.map((a, i) => (
              <div key={i} className="grid grid-cols-5 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors last:border-b-0">
                <div>{new Date(a.date).toLocaleDateString()}</div>
                <div className="text-muted">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                <div className="text-muted">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                <div className="text-muted">{a.workDurationHours ? a.workDurationHours.toFixed(1) + 'h' : '—'}</div>
                <div className={a.status === 'Present' ? 'text-green-400' : a.status === 'Half-day' ? 'text-yellow-400' : 'text-red-400'}>{a.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;

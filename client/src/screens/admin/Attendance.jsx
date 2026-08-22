import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get('/attendance/admin');
        setRecords(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAttendance();
  }, []);

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading real-time attendance...</div>;

  const statusColor = (s) => {
    switch (s) {
      case 'Present': return 'text-green-400 border-green-900 bg-green-950/20';
      case 'Half-day': return 'text-yellow-400 border-yellow-900 bg-yellow-950/20';
      case 'Leave': return 'text-purple-400 border-purple-900 bg-purple-950/20';
      case 'Absent': default: return 'text-red-400 border-red-900 bg-red-950/20';
    }
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const halfDayCount = records.filter(r => r.status === 'Half-day').length;
  const leaveCount = records.filter(r => r.status === 'Leave').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-sora text-3xl font-light mb-2">Workforce Real-Time Status</h1>
          <p className="font-mono text-muted text-sm">Today's live attendance & leave cross-reference from MongoDB Atlas</p>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-border p-4 bg-surface-50">
          <p className="font-mono text-xs text-muted uppercase tracking-widest">Present Today</p>
          <p className="font-sora text-3xl font-light text-green-400 mt-1">{presentCount}</p>
        </div>
        <div className="border border-border p-4 bg-surface-50">
          <p className="font-mono text-xs text-muted uppercase tracking-widest">Half-Day</p>
          <p className="font-sora text-3xl font-light text-yellow-400 mt-1">{halfDayCount}</p>
        </div>
        <div className="border border-border p-4 bg-surface-50">
          <p className="font-mono text-xs text-muted uppercase tracking-widest">On Approved Leave</p>
          <p className="font-sora text-3xl font-light text-purple-400 mt-1">{leaveCount}</p>
        </div>
        <div className="border border-border p-4 bg-surface-50">
          <p className="font-mono text-xs text-muted uppercase tracking-widest">Absent</p>
          <p className="font-sora text-3xl font-light text-red-400 mt-1">{absentCount}</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="border border-border p-12 text-center font-mono text-sm text-muted">No workforce records found in MongoDB.</div>
      ) : (
        <div className="border border-border">
          <div className="grid grid-cols-5 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
            <div>Employee</div><div>Employee ID</div><div>Check In</div><div>Check Out</div><div>Real-Time Status</div>
          </div>
          {records.map((r, i) => (
            <div key={i} className="grid grid-cols-5 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors items-center last:border-b-0">
              <div>
                <div className="font-semibold text-primary">{r.user?.profile?.firstName} {r.user?.profile?.lastName}</div>
                <div className="text-xs text-muted">{r.user?.email}</div>
              </div>
              <div className="font-mono text-xs text-muted">{r.user?.employeeId}</div>
              <div className="text-muted font-mono">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
              <div className="text-muted font-mono">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
              <div>
                <span className={`px-3 py-1 border text-xs font-mono uppercase tracking-wider inline-block ${statusColor(r.status)}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, leaveRes, attRes] = await Promise.all([
          axios.get('/employees/admin'),
          axios.get('/leave/admin'),
          axios.get('/attendance/admin')
        ]);

        const employees = empRes.data;
        const leaves = leaveRes.data;
        const attendance = attRes.data;

        const today = new Date().toDateString();
        const todaysAtt = attendance.filter(a => new Date(a.date).toDateString() === today);
        const presentCount = todaysAtt.filter(a => a.status === 'Present' || a.status === 'Half-day').length;
        const presentRate = employees.length > 0
          ? ((presentCount / employees.length) * 100).toFixed(1) + '%'
          : '0%';
        const onLeave = todaysAtt.filter(a => a.status === 'Leave').length;
        const pendingRequests = leaves.filter(l => l.status === 'Pending').length;

        const recentActivity = [];
        todaysAtt.slice(0, 5).forEach(a => {
          if (a.checkIn) {
            recentActivity.push({
              employeeId: a.user?.employeeId || '—',
              name: `${a.user?.profile?.firstName || ''} ${a.user?.profile?.lastName || ''}`.trim(),
              action: a.checkOut ? 'Check Out' : 'Check In',
              time: new Date(a.checkOut || a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: a.status
            });
          }
        });

        setStats({ workforce: employees.length, presentRate, onLeave, pendingRequests, recentActivity });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="font-mono text-sm text-muted">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">Command Center</h1>
        <p className="font-mono text-muted text-sm uppercase tracking-widest">Overview of workforce operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
        {[
          { label: 'Workforce', value: stats.workforce },
          { label: 'Present Today', value: stats.presentRate },
          { label: 'On Leave', value: stats.onLeave },
          { label: 'Pending Requests', value: String(stats.pendingRequests).padStart(2, '0'), highlight: stats.pendingRequests > 0 }
        ].map((item) => (
          <div key={item.label} className="bg-background p-6 hover:bg-surface-50 transition-colors">
            <h3 className="font-mono text-xs tracking-widest uppercase mb-4 text-secondary">{item.label}</h3>
            <div className={`font-sora text-4xl font-light ${item.highlight ? 'text-yellow-400' : ''}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-sora text-xl font-light mb-4">Today's Activity</h2>
        <div className="border border-border">
          <div className="grid grid-cols-4 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
            <div>Employee</div><div>Action</div><div>Time</div><div>Status</div>
          </div>
          {stats.recentActivity.length === 0 ? (
            <div className="p-8 text-center font-mono text-sm text-muted">No activity recorded today.</div>
          ) : (
            stats.recentActivity.map((a, i) => (
              <div key={i} className="grid grid-cols-4 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors last:border-b-0">
                <div>
                  <div>{a.name}</div>
                  <div className="text-xs text-muted">{a.employeeId}</div>
                </div>
                <div>{a.action}</div>
                <div className="text-muted">{a.time}</div>
                <div className={a.status === 'Present' ? 'text-green-400' : 'text-yellow-400'}>{a.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

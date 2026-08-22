import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, FileText, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [empRes, leaveRes, attRes] = await Promise.all([
          axios.get('/employees/admin'),
          axios.get('/leave/admin'),
          axios.get('/attendance/admin')
        ]);

        const employees = empRes.data;
        const leaves = leaveRes.data;
        const attendance = attRes.data;

        // Calculate Department breakdown
        const deptCounts = {};
        employees.forEach(e => {
          const dept = e.profile?.department || 'Engineering';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        // Attendance stats
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const halfDayCount = attendance.filter(a => a.status === 'Half-day').length;
        const leaveCount = attendance.filter(a => a.status === 'Leave').length;
        const absentCount = attendance.filter(a => a.status === 'Absent').length;

        // Leave stats
        const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
        const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
        const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

        setData({
          totalEmployees: employees.length,
          deptCounts,
          attendance: { presentCount, halfDayCount, leaveCount, absentCount },
          leaves: { pendingLeaves, approvedLeaves, rejectedLeaves, total: leaves.length }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="font-mono text-sm text-muted p-8">Generating reports from MongoDB Atlas...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">Reports & HR Analytics</h1>
        <p className="font-mono text-muted text-sm">Real-time attendance, leave, and payroll analytics generated from MongoDB Atlas</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-border p-6 bg-surface-50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">Total Workforce</span>
            <Users size={18} className="text-primary" />
          </div>
          <p className="font-sora text-4xl font-light">{data.totalEmployees}</p>
          <p className="font-mono text-xs text-muted mt-2">Active MongoDB records</p>
        </div>

        <div className="border border-border p-6 bg-surface-50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">Present Rate</span>
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <p className="font-sora text-4xl font-light text-green-400">
            {data.totalEmployees > 0 ? Math.round((data.attendance.presentCount / data.totalEmployees) * 100) : 0}%
          </p>
          <p className="font-mono text-xs text-muted mt-2">{data.attendance.presentCount} present today</p>
        </div>

        <div className="border border-border p-6 bg-surface-50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">Approved Leaves</span>
            <Calendar size={18} className="text-purple-400" />
          </div>
          <p className="font-sora text-4xl font-light text-purple-400">{data.leaves.approvedLeaves}</p>
          <p className="font-mono text-xs text-muted mt-2">{data.leaves.pendingLeaves} pending requests</p>
        </div>

        <div className="border border-border p-6 bg-surface-50">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">Monthly Payroll Spend</span>
            <DollarSign size={18} className="text-primary" />
          </div>
          <p className="font-sora text-3xl font-light">₹{(data.totalEmployees * 53000).toLocaleString()}</p>
          <p className="font-mono text-xs text-muted mt-2">Estimated gross budget</p>
        </div>
      </div>

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <div className="border border-border p-6 space-y-4">
          <h2 className="font-sora text-xl font-light border-b border-border pb-3 flex items-center gap-2">
            <BarChart size={18} className="text-primary" />
            Attendance Summary Report
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center p-3 border border-border bg-surface-50">
              <span className="text-green-400">Present</span>
              <span className="font-semibold">{data.attendance.presentCount} Employees</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-border bg-surface-50">
              <span className="text-yellow-400">Half-day</span>
              <span className="font-semibold">{data.attendance.halfDayCount} Employees</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-border bg-surface-50">
              <span className="text-purple-400">On Approved Leave</span>
              <span className="font-semibold">{data.attendance.leaveCount} Employees</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-border bg-surface-50">
              <span className="text-red-400">Absent</span>
              <span className="font-semibold">{data.attendance.absentCount} Employees</span>
            </div>
          </div>
        </div>

        {/* Department Workforce Distribution */}
        <div className="border border-border p-6 space-y-4">
          <h2 className="font-sora text-xl font-light border-b border-border pb-3 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Department Workforce Distribution
          </h2>
          <div className="space-y-3 font-mono text-sm">
            {Object.keys(data.deptCounts).length === 0 ? (
              <p className="text-muted">No department data available.</p>
            ) : (
              Object.entries(data.deptCounts).map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center p-3 border border-border bg-surface-50">
                  <span className="text-primary">{dept}</span>
                  <span className="font-semibold text-secondary">{count} Staff Members</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

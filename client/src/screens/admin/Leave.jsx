import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/leave/admin');
      setLeaves(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAction = async (id, action) => {
    setActionId(id); setMsg('');
    try {
      await axios.patch(`/leave/admin/${id}/${action}`);
      setMsg(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      await fetchLeaves();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Action failed');
    } finally { setActionId(null); }
  };

  const statusColor = (s) => s === 'Approved' ? 'text-green-400' : s === 'Rejected' ? 'text-red-400' : 'text-yellow-400';

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading leave requests...</div>;

  const pending = leaves.filter(l => l.status === 'Pending');
  const resolved = leaves.filter(l => l.status !== 'Pending');

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">Leave Approvals</h1>
        <p className="font-mono text-muted text-sm">{pending.length} pending requests</p>
      </div>

      {msg && <div className="p-4 border border-border bg-surface-50 font-mono text-sm text-secondary">{msg}</div>}

      {pending.length > 0 && (
        <div>
          <h2 className="font-sora text-xl font-light mb-4">Pending Requests</h2>
          <div className="border border-border">
            <div className="grid grid-cols-6 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
              <div>Employee</div><div>Type</div><div>From</div><div>To</div><div>Remarks</div><div>Actions</div>
            </div>
            {pending.map((l) => (
              <div key={l._id} className="grid grid-cols-6 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors items-center last:border-b-0">
                <div>
                  <div>{l.user?.profile?.firstName} {l.user?.profile?.lastName}</div>
                  <div className="text-xs text-muted">{l.user?.employeeId}</div>
                </div>
                <div>{l.type}</div>
                <div className="text-muted">{new Date(l.startDate).toLocaleDateString()}</div>
                <div className="text-muted">{new Date(l.endDate).toLocaleDateString()}</div>
                <div className="text-muted text-xs truncate">{l.remarks || '—'}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(l._id, 'approve')} disabled={actionId === l._id}
                    className="px-3 py-1 border border-green-600 text-green-400 text-xs font-mono hover:bg-green-900/30 transition-colors disabled:opacity-50">
                    Approve
                  </button>
                  <button onClick={() => handleAction(l._id, 'reject')} disabled={actionId === l._id}
                    className="px-3 py-1 border border-red-800 text-red-400 text-xs font-mono hover:bg-red-900/30 transition-colors disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="font-sora text-xl font-light mb-4">Resolved Requests</h2>
          <div className="border border-border">
            <div className="grid grid-cols-5 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
              <div>Employee</div><div>Type</div><div>Dates</div><div>Status</div><div>Comments</div>
            </div>
            {resolved.map((l) => (
              <div key={l._id} className="grid grid-cols-5 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors last:border-b-0">
                <div>{l.user?.profile?.firstName} {l.user?.profile?.lastName}</div>
                <div>{l.type}</div>
                <div className="text-muted text-xs">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</div>
                <div className={statusColor(l.status)}>{l.status}</div>
                <div className="text-muted text-xs">{l.adminComments || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {leaves.length === 0 && (
        <div className="border border-border p-12 text-center font-mono text-sm text-muted">No leave requests found.</div>
      )}
    </div>
  );
};

export default AdminLeave;

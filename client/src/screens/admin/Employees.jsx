import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/employees/admin');
      setEmployees(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      firstName: emp.profile?.firstName || '',
      lastName: emp.profile?.lastName || '',
      department: emp.profile?.department || '',
      jobTitle: emp.profile?.jobTitle || '',
      phone: emp.profile?.phone || '',
      address: emp.profile?.address || '',
      avatar: emp.profile?.avatar || '',
      role: emp.role || 'employee'
    });
    setMsg({ text: '', isError: false });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/employees/admin/${editing._id}`, form);
      setMsg({ text: 'Employee details updated in MongoDB Atlas!', isError: false });
      setEditing(null);
      await fetchEmployees();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', isError: true });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading workforce...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border">
        <h1 className="font-sora text-3xl font-light mb-2">Workforce Directory</h1>
        <p className="font-mono text-muted text-sm">{employees.length} total active workforce records</p>
      </div>

      {msg.text && (
        <div className={`p-4 border font-mono text-sm ${msg.isError ? 'border-red-900/50 bg-red-950/20 text-red-400' : 'border-green-900/50 bg-green-950/20 text-green-400'}`}>
          {msg.text}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="border border-border p-6 space-y-6">
          <h2 className="font-sora text-xl font-light">
            Edit Employee — {editing.profile?.firstName} {editing.profile?.lastName} ({editing.employeeId})
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">First Name</label>
              <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Last Name</label>
              <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Department</label>
              <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Job Title</label>
              <input type="text" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">System Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full bg-background border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary cursor-pointer">
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Profile Avatar URL</label>
              <input type="text" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..."
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Address</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" disabled={saving}
              className="px-8 py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase disabled:opacity-50">
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button type="button" onClick={() => setEditing(null)}
              className="px-8 py-3 border border-border text-sm font-mono text-muted hover:text-primary hover:border-primary transition-colors uppercase">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-border">
        <div className="grid grid-cols-6 p-4 border-b border-border font-mono text-xs tracking-widest uppercase text-secondary">
          <div>ID</div><div>Employee Name</div><div>Role</div><div>Department</div><div>Job Title</div><div>Action</div>
        </div>
        {employees.length === 0 ? (
          <div className="p-8 text-center font-mono text-sm text-muted">No employees found.</div>
        ) : (
          employees.map(emp => (
            <div key={emp._id} className="grid grid-cols-6 p-4 border-b border-border font-mono text-sm hover:bg-surface-50 transition-colors items-center last:border-b-0">
              <div className="font-mono text-xs text-muted">{emp.employeeId}</div>
              <div className="flex items-center gap-3">
                {emp.profile?.avatar ? (
                  <img src={emp.profile.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-surface-200 border border-border flex items-center justify-center text-[10px] font-mono">
                    {emp.profile?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                <span>{emp.profile?.firstName} {emp.profile?.lastName}</span>
              </div>
              <div className="text-xs font-mono uppercase">{emp.role}</div>
              <div className="text-muted">{emp.profile?.department || '—'}</div>
              <div className="text-muted">{emp.profile?.jobTitle || '—'}</div>
              <div>
                <button onClick={() => openEdit(emp)}
                  className="px-4 py-1 border border-border text-xs font-mono hover:border-primary hover:text-primary transition-colors uppercase">
                  Edit All
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEmployees;

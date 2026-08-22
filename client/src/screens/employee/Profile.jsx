import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Camera, User as UserIcon } from 'lucide-react';

const EmployeeProfile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ phone: '', address: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/employees/me');
        setForm({
          phone: res.data.profile?.phone || '',
          address: res.data.profile?.address || '',
          avatar: res.data.profile?.avatar || ''
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMsg({ text: 'Image file size must be less than 2MB', isError: true });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', isError: false });
    try {
      await axios.put('/employees/me', form);
      await refreshUser();
      setMsg({ text: 'Profile & picture updated successfully in MongoDB Atlas!', isError: false });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', isError: true });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="font-mono text-sm text-muted p-8">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="pb-8 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-sora text-3xl font-light mb-2">My Profile</h1>
          <p className="font-mono text-muted text-sm">View organization info and update personal details</p>
        </div>
        {/* Profile Avatar Display */}
        <div className="relative group">
          {form.avatar || user?.profile?.avatar ? (
            <img
              src={form.avatar || user?.profile?.avatar}
              alt="Profile Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-border bg-surface-100 flex items-center justify-center text-secondary">
              <UserIcon size={32} />
            </div>
          )}
        </div>
      </div>

      {/* Read-Only Information from MongoDB Atlas */}
      <div className="border border-border p-6 space-y-4">
        <h2 className="font-sora text-lg font-light border-b border-border pb-3">Organization Details (Read-Only)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Full Name</p>
            <p className="font-sora text-lg font-light">{user?.profile?.firstName} {user?.profile?.lastName}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Employee ID</p>
            <p className="font-mono text-sm">{user?.employeeId}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Email</p>
            <p className="font-mono text-sm text-muted">{user?.email}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Role</p>
            <p className="font-mono text-sm uppercase">{user?.role}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Department</p>
            <p className="font-mono text-sm text-muted">{user?.profile?.department || 'Engineering'}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-1">Job Title</p>
            <p className="font-mono text-sm text-muted">{user?.profile?.jobTitle || 'Software Engineer'}</p>
          </div>
        </div>
      </div>

      {/* Employee Editable Information (ONLY Phone, Address, Profile Picture) */}
      {msg.text && (
        <div className={`p-4 border font-mono text-sm ${msg.isError ? 'border-red-900/50 bg-red-950/20 text-red-400' : 'border-green-900/50 bg-green-950/20 text-green-400'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="border border-border p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-sora text-lg font-light">Personal Information (Editable)</h2>
          <span className="font-mono text-xs text-muted">You can edit: Phone, Address, Profile Picture</span>
        </div>

        {/* Profile Picture Upload & URL Input */}
        <div className="space-y-3">
          <label className="block font-mono text-xs text-secondary tracking-widest uppercase flex items-center gap-2">
            <Camera size={14} />
            Profile Picture
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="font-mono text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border file:border-border file:bg-surface-100 file:text-primary file:font-mono hover:file:border-primary file:cursor-pointer"
            />
            <span className="font-mono text-xs text-muted">or paste Image URL:</span>
            <input
              type="url"
              value={form.avatar}
              onChange={e => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://..."
              className="flex-1 bg-transparent border-b border-border py-1 text-primary font-mono text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Phone Number</label>
          <input
            type="text"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full bg-transparent border-b border-border py-2 text-primary font-mono focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="block font-mono text-xs text-secondary tracking-widest uppercase">Address</label>
          <textarea
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            rows={3}
            placeholder="City, Country..."
            className="w-full bg-transparent border border-border p-3 text-primary font-mono text-sm focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-muted"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 border border-primary text-sm font-mono hover:bg-primary hover:text-background transition-colors uppercase tracking-wider disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeProfile;

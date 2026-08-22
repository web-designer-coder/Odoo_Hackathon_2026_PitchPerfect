import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, User, LayoutDashboard, Calendar, Clock, CreditCard, Users, BarChart, CheckCircle } from 'lucide-react';
import axios from 'axios';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 text-sm font-mono transition-colors border-l-2 ${
        isActive
          ? 'border-primary text-primary bg-surface-100'
          : 'border-transparent text-muted hover:text-primary hover:bg-surface-50'
      }`
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const basePath = isAdmin ? '/admin' : '/app';

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications/me');
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTitle = (pathname) => {
    const path = pathname.split('/').pop();
    if (path === 'app' || path === 'admin') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background text-primary overflow-hidden selection:bg-surface-200">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-surface-50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="font-sora font-semibold text-lg tracking-widest">DAYFLOW</h1>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
          <SidebarItem to={basePath} icon={LayoutDashboard} label="Dashboard" />

          {isAdmin ? (
            <>
              <SidebarItem to={`${basePath}/employees`} icon={Users} label="Employees" />
              <SidebarItem to={`${basePath}/attendance`} icon={Clock} label="Attendance" />
              <SidebarItem to={`${basePath}/leave`} icon={Calendar} label="Leave" />
              <SidebarItem to={`${basePath}/payroll`} icon={CreditCard} label="Payroll" />
              <SidebarItem to={`${basePath}/reports`} icon={BarChart} label="Reports" />
            </>
          ) : (
            <>
              <SidebarItem to={`${basePath}/attendance`} icon={Clock} label="Attendance" />
              <SidebarItem to={`${basePath}/leave`} icon={Calendar} label="Leave" />
              <SidebarItem to={`${basePath}/payroll`} icon={CreditCard} label="Payroll" />
              <SidebarItem to={`${basePath}/profile`} icon={User} label="Profile" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-mono text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/50 flex-shrink-0 relative">
          <h2 className="font-sora text-sm font-medium tracking-wide uppercase">
            {formatTitle(location.pathname)}
          </h2>
          <div className="flex items-center gap-6">
            {/* Bell Icon & Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-muted hover:text-primary transition-colors p-1 cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-background border border-border p-4 shadow-xl z-50 space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-semibold uppercase tracking-wider text-primary">Notifications</span>
                    <span className="text-muted">{unreadCount} unread</span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-muted text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        className={`p-3 border transition-colors flex items-start justify-between gap-2 ${
                          n.isRead ? 'border-border/40 opacity-70 bg-surface-50' : 'border-primary/50 bg-surface-100'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-primary">{n.title}</p>
                          <p className="text-muted text-[11px] leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="text-primary hover:text-green-400 p-1"
                            title="Mark as Read"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Profile Summary */}
            <div className="flex items-center gap-3">
              {user?.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-primary"
                />
              ) : (
                <div className="w-8 h-8 bg-surface-200 border border-border flex items-center justify-center text-xs font-mono">
                  {user?.profile?.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm font-mono text-secondary">
                {user?.profile?.firstName} <span className="text-muted text-xs uppercase">({user?.role})</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './screens/Landing';
import Login from './screens/Login';
import Signup from './screens/Signup';
import OAuthCallback from './screens/OAuthCallback';
import EmployeeDashboard from './screens/employee/Dashboard';
import EmployeeAttendance from './screens/employee/Attendance';
import EmployeeLeave from './screens/employee/Leave';
import EmployeePayroll from './screens/employee/Payroll';
import EmployeeProfile from './screens/employee/Profile';
import AdminDashboard from './screens/admin/Dashboard';
import AdminEmployees from './screens/admin/Employees';
import AdminAttendance from './screens/admin/Attendance';
import AdminLeave from './screens/admin/Leave';
import AdminPayroll from './screens/admin/Payroll';
import AdminReports from './screens/admin/Reports';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' || user.role === 'hr' ? '/admin' : '/app'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const defaultPath = user?.role === 'admin' || user?.role === 'hr' ? '/admin' : '/app';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={defaultPath} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={defaultPath} replace /> : <Signup />} />

        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Employee Routes */}
        <Route path="/app" element={
          <PrivateRoute roles={['employee']}>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leave" element={<EmployeeLeave />} />
          <Route path="payroll" element={<EmployeePayroll />} />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>

        {/* Admin / HR Routes */}
        <Route path="/admin" element={
          <PrivateRoute roles={['admin', 'hr']}>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="leave" element={<AdminLeave />} />
          <Route path="payroll" element={<AdminPayroll />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

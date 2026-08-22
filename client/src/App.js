import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './css/tailwind.css';
import { AuthProvider } from './contexts/AuthContext';

// Import pages (we'll create these later)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import PayrollPage from './pages/PayrollPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/employee/*" 
            element={
              <ProtectedRoute requiredRoles={['employee']}>
                <EmployeeRoutes />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
          
          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Protected route component
function ProtectedRoute({ children, requiredRoles }) {
  const { user } = React.useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!requiredRoles.includes(user.role)) {
    // If employee trying to access admin routes, go to employee dashboard
    if (user.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    // If admin trying to access employee-only routes (shouldn't happen in our setup)
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
}

// Employee routes
function EmployeeRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<EmployeeDashboard />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="leave" element={<LeavePage />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Routes>
  );
}

// Admin routes
function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="employees" element={<EmployeesPage />} />
      <Route path="employees/:id" element={<EmployeeProfilePage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="leave" element={<LeavePage />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Routes>
  );
}

export default App;

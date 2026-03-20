import { useState, createContext, useContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import RiskEngine from './pages/user/RiskEngine';
import Policies from './pages/user/Policies';
import Claims from './pages/user/Claims';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPolicies from './pages/admin/AdminPolicies';
import AdminClaims from './pages/admin/AdminClaims';
import AdminFraud from './pages/admin/AdminFraud';
import AdminEvents from './pages/admin/AdminEvents';
import AdminPayments from './pages/admin/AdminPayments';
import AdminConfig from './pages/admin/AdminConfig';
import Toast from './components/Toast';

export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleLogin = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isUser = user?.role === 'user';
  const isAdmin = user?.role === 'admin';

  return (
    <ToastContext.Provider value={addToast}>
      <Router>
        <Toast toasts={toasts} onRemove={removeToast} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            !user ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
          } />
          <Route path="/register" element={
            !user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />
          } />

          {/* User Routes */}
          <Route path="/dashboard" element={
            isUser
              ? <UserLayout user={user} onLogout={handleLogout}><Dashboard user={user} /></UserLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/profile" element={
            isUser
              ? <UserLayout user={user} onLogout={handleLogout}><Profile user={user} /></UserLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/risk" element={
            isUser
              ? <UserLayout user={user} onLogout={handleLogout}><RiskEngine user={user} /></UserLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/policies" element={
            isUser
              ? <UserLayout user={user} onLogout={handleLogout}><Policies user={user} /></UserLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/claims" element={
            isUser
              ? <UserLayout user={user} onLogout={handleLogout}><Claims user={user} /></UserLayout>
              : <Navigate to="/login" replace />
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminDashboard /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/users" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminUsers /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/policies" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminPolicies /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/claims" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminClaims /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/fraud" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminFraud /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/events" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminEvents /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/payments" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminPayments /></AdminLayout>
              : <Navigate to="/login" replace />
          } />
          <Route path="/admin/config" element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout}><AdminConfig /></AdminLayout>
              : <Navigate to="/login" replace />
          } />

          {/* Catch-all */}
          <Route path="*" element={
            <Navigate to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} replace />
          } />
        </Routes>
      </Router>
    </ToastContext.Provider>
  );
}

export default App;

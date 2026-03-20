import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/admin', icon: '📊', label: 'Analytics', exact: true },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/policies', icon: '📋', label: 'Policies' },
  { to: '/admin/claims', icon: '📝', label: 'Claims' },
  { to: '/admin/fraud', icon: '🚨', label: 'Fraud Alerts' },
  { to: '/admin/events', icon: '📡', label: 'Events' },
  { to: '/admin/payments', icon: '💳', label: 'Payments' },
  { to: '/admin/config', icon: '⚙️', label: 'System Config' },
];

export default function AdminLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🛡️</div>
          <div>
            <div className="logo-text">Guidewares</div>
            <div className="logo-sub" style={{ color: 'var(--rose)', opacity: 0.8 }}>Admin Panel</div>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Admin Panel</div>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout} title="Click to logout">
            <div className="user-avatar" style={{ background: 'linear-gradient(135deg, var(--rose), var(--amber))' }}>
              A
            </div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">🚪 Click to logout</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="page-header">
          <button
            className="btn-icon"
            style={{ display: 'none' }}
            id="sidebar-toggle-admin"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <style>{`
            @media (max-width: 900px) {
              #sidebar-toggle-admin { display: flex !important; }
            }
          `}</style>

          <div style={{ flex: 1 }} />

          <div className="flex items-center gap-12">
            <div className="badge badge-rose">
              <span>🔐</span> Admin
            </div>
          </div>
        </header>

        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}

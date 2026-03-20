import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AIAssistant from './AIAssistant';

const NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
  { to: '/risk', icon: '🤖', label: 'AI Risk Score' },
  { to: '/policies', icon: '📋', label: 'My Policies' },
  { to: '/claims', icon: '📝', label: 'My Claims' },
];

export default function UserLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
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
            <div className="logo-sub">AI Insurance</div>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Navigation</div>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
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
            <div className="user-avatar indigo">
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
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
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <style>{`
            @media (max-width: 900px) {
              #sidebar-toggle { display: flex !important; }
            }
          `}</style>

          <div style={{ flex: 1 }} />

          <div className="flex items-center gap-12">
            <div className="badge badge-cyan">
              <span>⚡</span> Gig Worker
            </div>
            <div
              className="user-avatar indigo"
              style={{ cursor: 'pointer' }}
              title={user?.username}
            >
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-body">
          {children}
        </div>
      </div>

      <AIAssistant user={user} />
    </div>
  );
}

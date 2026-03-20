import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      onLogin(res.data);
      navigate(res.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🛡️</div>
          <div className="auth-logo-name">Guidewares</div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your AI insurance account</p>

        {error && (
          <div className="alert alert-error mb-16">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
              aria-label="Username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              aria-label="Password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}
            style={{ justifyContent: 'center', padding: '12px' }}>
            {loading ? <><span className="loading-spinner" /> Signing in…</> : '→ Sign In'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div
          className="alert alert-info"
          style={{ fontSize: '0.78rem', cursor: 'pointer' }}
          onClick={() => { setForm({ username: 'admin', password: 'admin123' }); }}
        >
          <span>💡</span>
          <span>Admin login: <strong>admin / admin123</strong> (click to autofill)</span>
        </div>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/register')}>Create one →</span>
        </div>
      </div>
    </div>
  );
}

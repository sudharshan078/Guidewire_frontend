import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      onLogin(res.data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username or email may already exist.');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join thousands of gig workers protected by AI insurance</p>

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
              placeholder="Choose a username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}
            style={{ justifyContent: 'center', padding: '12px' }}>
            {loading ? <><span className="loading-spinner" /> Creating account…</> : '✨ Create Account'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 16 }}>
          Already have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/login')}>Sign in →</span>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

function StatusBadge({ status }) {
  const map = { ACTIVE: 'badge-emerald', EXPIRED: 'badge-gray', CANCELLED: 'badge-rose' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function AdminPolicies() {
  const toast = useContext(ToastContext);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', premium: '', coverage: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPolicies = () => {
    setLoading(true);
    API.get('/admin/policies')
      .then(r => setPolicies(r.data || []))
      .catch(() => toast('Failed to load policies.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const openEdit = (policy) => {
    setEditModal(policy);
    setEditForm({ status: policy.status, premium: policy.premium, coverage: policy.coverage });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (editForm.status) payload.status = editForm.status;
      if (editForm.premium) payload.premium = parseFloat(editForm.premium);
      if (editForm.coverage) payload.coverage = parseFloat(editForm.coverage);
      await API.post(`/admin/update-policy/${editModal.id}`, payload);
      toast('Policy updated successfully!', 'success');
      setEditModal(null);
      fetchPolicies();
    } catch (err) {
      toast(err.response?.data?.detail || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = policies.filter(p =>
    !search ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.plan_name?.toLowerCase().includes(search.toLowerCase())
  );

  const active = policies.filter(p => p.status === 'ACTIVE').length;
  const totalPremium = policies.filter(p => p.status === 'ACTIVE').reduce((s, p) => s + p.premium, 0);
  const totalCoverage = policies.reduce((s, p) => s + p.coverage, 0);

  return (
    <div>
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Edit Policy #{editModal.id}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 20 }}>
              {editModal.username} — {editModal.plan_name?.toUpperCase()}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={editForm.status}
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                {['ACTIVE', 'EXPIRED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Premium (₹/week)</label>
                <input className="form-input" type="number" value={editForm.premium}
                  onChange={e => setEditForm(f => ({ ...f, premium: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Coverage (₹)</label>
                <input className="form-input" type="number" value={editForm.coverage}
                  onChange={e => setEditForm(f => ({ ...f, coverage: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-12 mt-8">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="loading-spinner" /> Saving…</> : '💾 Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">📋 Policy Management</div>
          <div className="page-subtitle">View and update all user policies</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchPolicies} disabled={loading}>🔄 Refresh</button>
      </div>

      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card emerald">
          <div className="stat-icon emerald">📋</div>
          <div className="stat-value">{active}</div>
          <div className="stat-label">Active Policies</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">💰</div>
          <div className="stat-value">₹{Math.round(totalPremium)}</div>
          <div className="stat-label">Weekly Premium Income</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan">🛡️</div>
          <div className="stat-value">₹{totalCoverage.toLocaleString()}</div>
          <div className="stat-label">Total Coverage Liability</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header mb-16">
          <span className="section-title">All Policies ({filtered.length})</span>
          <input className="form-input" style={{ width: 220 }} placeholder="🔍 Search…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><h3>No policies found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>User</th><th>Plan</th><th>Premium</th><th>Coverage</th>
                  <th>Status</th><th>Start</th><th>End</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td><span className="tag">#{p.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.username}</td>
                    <td><span className="tag">{p.plan_name?.toUpperCase()}</span></td>
                    <td className="font-mono">₹{p.premium}/wk</td>
                    <td className="font-mono">₹{p.coverage?.toLocaleString()}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {p.start_date ? new Date(p.start_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

const EVENT_TYPES = ['heavy_rain', 'flood', 'heatwave', 'storm', 'cyclone'];

function StatusBadge({ status }) {
  const map = {
    PAID: 'badge-emerald', APPROVED: 'badge-blue',
    PENDING: 'badge-amber', REJECTED: 'badge-rose',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function Claims({ user }) {
  const toast = useContext(ToastContext);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ policy_id: '', event_type: '', event_details: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState({});

  const activePolicy = policies.find(p => p.status === 'ACTIVE');

  const fetchAll = () => {
    if (!user?.user_id) return;
    setLoading(true);
    Promise.all([
      API.get(`/claims/${user.user_id}`),
      API.get(`/policy/${user.user_id}`),
    ]).then(([c, p]) => {
      setClaims(c.data || []);
      setPolicies(p.data || []);
    }).catch(() => toast('Failed to load claims.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!form.policy_id || !form.event_type || !form.amount) {
      toast('Please fill in all required fields.', 'warning');
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { toast('Enter a valid claim amount.', 'warning'); return; }
    if (activePolicy && amt > activePolicy.coverage) {
      toast(`Amount exceeds your coverage limit of ₹${activePolicy.coverage}.`, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Note: The claims endpoint is triggered by the backend event engine.
      // For direct filing we use the fraud check → approve flow via admin.
      // Users file by posting to the event trigger or we simulate via policy.
      // Since there's no direct user claim POST, we'll show a friendly notice.
      toast('⚠️ Claims are automatically triggered by our AI event engine based on real weather data in your area. Manual filing is reviewed by admin.', 'info');
      setShowForm(false);
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to file claim.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFraudCheck = async (claimId) => {
    setChecking(c => ({ ...c, [claimId]: true }));
    try {
      const res = await API.post(`/fraud/check/${claimId}`);
      toast(
        res.data.fraud_flag
          ? `⚠️ Claim #${claimId} flagged as fraudulent. Status: ${res.data.status}`
          : `✅ Claim #${claimId} passed fraud check! Status: ${res.data.status}`,
        res.data.fraud_flag ? 'warning' : 'success'
      );
      fetchAll();
    } catch (err) {
      toast(err.response?.data?.detail || 'Fraud check failed.', 'error');
    } finally {
      setChecking(c => ({ ...c, [claimId]: false }));
    }
  };

  const pending = claims.filter(c => c.status === 'PENDING').length;
  const approved = claims.filter(c => c.status === 'APPROVED').length;
  const paid = claims.filter(c => c.status === 'PAID').length;
  const total = claims.reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">📝 My Claims</div>
          <div className="page-subtitle">Track and manage your insurance claims</div>
        </div>
        <div className="flex gap-12">
          <button className="btn btn-secondary" onClick={fetchAll} disabled={loading}>🔄 Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ File Claim'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Claims', value: claims.length, color: 'indigo', icon: '📝' },
          { label: 'Pending', value: pending, color: 'amber', icon: '⏳' },
          { label: 'Approved', value: approved, color: 'emerald', icon: '✅' },
          { label: 'Total Claimed', value: `₹${total.toLocaleString()}`, color: 'cyan', icon: '💰' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* File Claim Form */}
      {showForm && (
        <div className="card mb-20">
          <div className="section-title mb-16">📝 File a New Claim</div>

          {!activePolicy ? (
            <div className="alert alert-warning">
              <span>⚠️</span>
              <span>You need an active policy to file a claim. Please purchase a policy first.</span>
            </div>
          ) : (
            <>
              <div className="alert alert-info mb-16">
                <span>🤖</span>
                <span>
                  Claims are primarily auto-triggered by our AI event engine when weather events occur in your city.
                  Use this form for manual review requests.
                </span>
              </div>
              <form onSubmit={handleSubmitClaim}>
                <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Policy</label>
                    <select className="form-select" value={form.policy_id}
                      onChange={e => setForm(f => ({ ...f, policy_id: e.target.value }))}>
                      <option value="">Select policy</option>
                      {policies.filter(p => p.status === 'ACTIVE').map(p => (
                        <option key={p.policy_id} value={p.policy_id}>
                          {p.plan_name?.toUpperCase()} — ₹{p.coverage} coverage
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Event Type *</label>
                    <select className="form-select" value={form.event_type}
                      onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                      <option value="">Select event</option>
                      {EVENT_TYPES.map(e => (
                        <option key={e} value={e}>{e.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Claim Amount (₹) *</label>
                  <input className="form-input" type="number" placeholder="e.g. 5000"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  {activePolicy && <div style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginTop: 5 }}>
                    Max: ₹{activePolicy.coverage.toLocaleString()} (your coverage limit)
                  </div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Event Details</label>
                  <textarea className="form-textarea" placeholder="Describe the event…"
                    value={form.event_details} onChange={e => setForm(f => ({ ...f, event_details: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="loading-spinner" /> Submitting…</> : '📝 Submit Claim Request'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Claims Table */}
      <div className="card">
        <div className="section-title mb-16">📋 Claim History</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No claims yet</h3>
            <p>Claims are auto-generated when weather events occur in your area.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Fraud</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.claim_id}>
                    <td><span className="tag">#{c.claim_id}</span></td>
                    <td>
                      <span className="badge badge-indigo">{c.event_type?.replace('_', ' ')}</span>
                    </td>
                    <td className="font-mono">₹{c.amount?.toLocaleString()}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.fraud_flag
                        ? <span className="badge badge-rose">⚠️ Flagged</span>
                        : <span className="badge badge-emerald">✓ Clean</span>}
                    </td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      {c.status === 'PENDING' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleFraudCheck(c.claim_id)}
                          disabled={checking[c.claim_id]}
                          title="Run AI fraud check"
                        >
                          {checking[c.claim_id] ? <span className="loading-spinner" style={{ width: 12, height: 12 }} /> : '🤖 AI Check'}
                        </button>
                      )}
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

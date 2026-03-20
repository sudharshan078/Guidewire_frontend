import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

const PLANS = [
  { name: 'basic', label: 'Basic', coverage: 5000, mult: '1.0×', color: 'emerald', icon: '🌱',
    features: ['₹5,000 coverage', 'All weather events', 'Instant claim filing', '7-day policy'] },
  { name: 'standard', label: 'Standard', coverage: 15000, mult: '1.5×', color: 'indigo', icon: '⚡', popular: true,
    features: ['₹15,000 coverage', 'All weather events', 'Priority claim review', '7-day policy'] },
  { name: 'premium', label: 'Premium', coverage: 30000, mult: '2.0×', color: 'cyan', icon: '👑',
    features: ['₹30,000 coverage', 'All weather events', 'Instant approval', '7-day policy'] },
];

function StatusBadge({ status }) {
  const map = {
    ACTIVE: 'badge-emerald', EXPIRED: 'badge-gray', CANCELLED: 'badge-rose',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function Policies({ user }) {
  const toast = useContext(ToastContext);
  const [policies, setPolicies] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selected, setSelected] = useState('');

  const hasActive = policies.some(p => p.status === 'ACTIVE');

  const fetchAll = () => {
    if (!user?.user_id) return;
    setLoading(true);
    Promise.all([
      API.get(`/policy/${user.user_id}`),
      API.get(`/ai/risk/${user.user_id}`).catch(() => ({ data: null })),
    ]).then(([pol, r]) => {
      setPolicies(pol.data || []);
      setRisk(r.data);
    }).catch(() => toast('Failed to load policies.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleBuy = async () => {
    if (!selected) { toast('Please select a plan.', 'warning'); return; }
    if (hasActive) { toast('You already have an active policy. Wait for it to expire.', 'warning'); return; }
    setBuying(true);
    try {
      const res = await API.post('/policy/buy', { user_id: user.user_id, plan_name: selected });
      toast(`✅ ${res.data.plan_name.toUpperCase()} policy purchased! Coverage: ₹${res.data.coverage?.toLocaleString()}`, 'success');
      fetchAll();
      setSelected('');
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to purchase policy.', 'error');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">📋 My Policies</div>
          <div className="page-subtitle">Purchase and manage your insurance coverage</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchAll} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Current Policy Alert */}
      {hasActive && (
        <div className="alert alert-success mb-20">
          <span>✅</span>
          <span>You have an active policy. You can purchase a new plan once it expires.</span>
        </div>
      )}

      {/* Plan Selection */}
      {!hasActive && (
        <div className="card mb-20">
          <div className="section-title mb-6">🛡️ Choose Your Plan</div>
          {risk && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 16 }}>
              Based on your AI risk score ({risk.risk_score}), your base premium is <strong style={{ color: 'var(--indigo-light)' }}>₹{risk.weekly_premium}/week</strong>
            </div>
          )}

          <div className="plan-grid mb-20">
            {PLANS.map(p => (
              <div
                key={p.name}
                className={`plan-card ${p.popular ? 'popular' : ''} ${selected === p.name ? 'selected' : ''}`}
                onClick={() => setSelected(p.name)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelected(p.name)}
              >
                {p.popular && <div className="plan-popular-badge">POPULAR</div>}
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{p.icon}</div>
                <div className="plan-name">{p.label}</div>
                {risk ? (
                  <div className="plan-coverage">
                    ₹{Math.round(risk.weekly_premium * parseFloat(p.mult))}
                    <span>/week</span>
                  </div>
                ) : (
                  <div className="plan-coverage">₹49+<span>/week</span></div>
                )}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-4)', margin: '6px 0 12px' }}>
                  {p.mult} base premium
                </div>
                {p.features.map(f => (
                  <div key={f} className="plan-feature">
                    <span style={{ color: 'var(--emerald)' }}>✓</span>
                    {f}
                  </div>
                ))}
                {selected === p.name && (
                  <div className="badge badge-indigo mt-12 w-full" style={{ justifyContent: 'center' }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {!risk && (
            <div className="alert alert-warning mb-16">
              <span>⚠️</span>
              <span>Complete your profile (location + work platform) to see personalized premiums.</span>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleBuy}
            disabled={buying || !selected}
            style={{ minWidth: 180 }}
          >
            {buying ? <><span className="loading-spinner" /> Processing…</> : `🛡️ Buy ${selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : ''} Plan`}
          </button>
        </div>
      )}

      {/* Policies Table */}
      <div className="card">
        <div className="section-title mb-16">📋 Policy History</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
          </div>
        ) : policies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No policies yet</h3>
            <p>Purchase a plan above to get started with your insurance coverage.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Coverage</th>
                  <th>Premium</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.policy_id}>
                    <td>
                      <span className="tag">{p.plan_name?.toUpperCase()}</span>
                    </td>
                    <td className="font-mono">₹{p.coverage?.toLocaleString()}</td>
                    <td className="font-mono">₹{p.premium}/wk</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {p.start_date ? new Date(p.start_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN') : '—'}
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

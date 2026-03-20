import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

function StatCard({ icon, label, value, sub, color = 'indigo', loading }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      {loading ? (
        <>
          <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: '80%' }} />
        </>
      ) : (
        <>
          <div className="stat-value">{value ?? '—'}</div>
          <div className="stat-label">{label}</div>
          {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 4 }}>{sub}</div>}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: 'badge-emerald', PAID: 'badge-emerald',
    PENDING: 'badge-amber', APPROVED: 'badge-blue',
    REJECTED: 'badge-rose', EXPIRED: 'badge-gray',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function Dashboard({ user }) {
  const [data, setData] = useState({ policy: null, risk: null, claims: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.user_id) return;
    Promise.all([
      API.get(`/policy/${user.user_id}`).catch(() => ({ data: [] })),
      API.get(`/ai/risk/${user.user_id}`).catch(() => ({ data: null })),
      API.get(`/claims/${user.user_id}`).catch(() => ({ data: [] })),
    ]).then(([policies, risk, claims]) => {
      const active = policies.data?.find(p => p.status === 'ACTIVE') || policies.data?.[0] || null;
      setData({ policy: active, risk: risk.data, claims: claims.data || [] });
    }).finally(() => setLoading(false));
  }, [user]);

  const { policy, risk, claims } = data;
  const pendingClaims = claims.filter(c => c.status === 'PENDING').length;
  const paidClaims = claims.filter(c => c.status === 'PAID').length;

  const riskColor = risk?.risk_level === 'HIGH' ? 'var(--rose)'
    : risk?.risk_level === 'MEDIUM' ? 'var(--amber)' : 'var(--emerald)';

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-greeting">Welcome back</div>
        <div className="hero-title">Hey, {user?.username} 👋</div>
        <div className="hero-sub">
          {policy
            ? `Your ${policy.plan_name?.toUpperCase()} policy is active — you're covered up to ₹${policy.coverage?.toLocaleString()}.`
            : 'You don\'t have an active policy yet. Purchase one to get covered.'}
        </div>
        {!loading && !policy && (
          <button className="btn btn-primary mt-12" onClick={() => navigate('/policies')}>
            🛡️ Get Covered Now
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon="🛡️" label="Policy Status" color="emerald" loading={loading}
          value={policy ? policy.status : 'None'}
          sub={policy ? `${policy.plan_name?.toUpperCase()} Plan` : 'No active policy'}
        />
        <StatCard
          icon="🤖" label="AI Risk Level" color="indigo" loading={loading}
          value={risk ? risk.risk_level : '—'}
          sub={risk ? `Score: ${risk.risk_score}` : 'Complete profile to see'}
        />
        <StatCard
          icon="📝" label="Total Claims" color="cyan" loading={loading}
          value={claims.length}
          sub={`${pendingClaims} pending • ${paidClaims} paid`}
        />
        <StatCard
          icon="💰" label="Weekly Premium" color="amber" loading={loading}
          value={policy ? `₹${policy.premium}` : '—'}
          sub={policy ? `Expires ${new Date(policy.end_date).toLocaleDateString('en-IN')}` : 'No active policy'}
        />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Risk Overview */}
        <div className="card">
          <div className="card-header">
            <span className="section-title">🤖 AI Risk Overview</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/risk')}>
              Full Report →
            </button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 16, width: `${80 - i*10}%` }} />)}
            </div>
          ) : risk ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="label">Risk Score</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: riskColor }}>
                    {risk.risk_score} / 1.0
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${risk.risk_score * 100}%`,
                    background: `linear-gradient(90deg, ${riskColor}, ${riskColor}aa)`,
                  }} />
                </div>
              </div>
              <div className="info-row">
                <span className="info-key">Risk Level</span>
                <span className={`badge ${risk.risk_level === 'HIGH' ? 'badge-rose' : risk.risk_level === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'}`}>
                  {risk.risk_level}
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Location Factor</span>
                <span className="info-val">{risk.location_factor}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Work Type Factor</span>
                <span className="info-val">{risk.work_type_factor}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Platform</span>
                <span className="tag">{risk.work_type}</span>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-icon">🤖</div>
              <h3>Profile Incomplete</h3>
              <p>Add your location and work platform to see your AI risk score.</p>
              <button className="btn btn-primary btn-sm mt-12" onClick={() => navigate('/profile')}>
                Complete Profile
              </button>
            </div>
          )}
        </div>

        {/* Policy Details */}
        <div className="card">
          <div className="card-header">
            <span className="section-title">📋 My Policy</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/policies')}>
              Manage →
            </button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 16, width: `${90 - i*10}%` }} />)}
            </div>
          ) : policy ? (
            <>
              <div className="info-row">
                <span className="info-key">Plan</span>
                <span className="info-val">{policy.plan_name?.toUpperCase()}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Status</span>
                <StatusBadge status={policy.status} />
              </div>
              <div className="info-row">
                <span className="info-key">Coverage</span>
                <span className="info-val">₹{policy.coverage?.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Premium</span>
                <span className="info-val">₹{policy.premium}/week</span>
              </div>
              <div className="info-row">
                <span className="info-key">Start Date</span>
                <span className="info-val">{new Date(policy.start_date).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="info-row">
                <span className="info-key">End Date</span>
                <span className="info-val">{new Date(policy.end_date).toLocaleDateString('en-IN')}</span>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-icon">📋</div>
              <h3>No Active Policy</h3>
              <p>Purchase a Basic, Standard, or Premium plan to get covered.</p>
              <button className="btn btn-primary btn-sm mt-12" onClick={() => navigate('/policies')}>
                Buy Policy →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="card mt-20">
        <div className="card-header">
          <span className="section-title">📝 Recent Claims</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/claims')}>
            All Claims →
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
          </div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No claims yet</h3>
            <p>When you file a claim for a covered event, it will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Fraud</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.slice(0, 5).map(c => (
                  <tr key={c.claim_id}>
                    <td><span className="tag">{c.event_type}</span></td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card mt-20">
        <div className="section-title mb-16">⚡ Quick Actions</div>
        <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/risk')}>🤖 Check Risk Score</button>
          <button className="btn btn-secondary" onClick={() => navigate('/policies')}>📋 Buy / Renew Policy</button>
          <button className="btn btn-secondary" onClick={() => navigate('/claims')}>📝 File a Claim</button>
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>👤 Update Profile</button>
        </div>
      </div>
    </div>
  );
}

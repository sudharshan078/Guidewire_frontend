import { useState, useEffect } from 'react';
import API from '../../api';

function BarChart({ data, colorFn }) {
  if (!data || Object.keys(data).length === 0) return (
    <div className="empty-state" style={{ padding: 20 }}><div className="empty-icon">📊</div><p>No data</p></div>
  );
  const max = Math.max(...Object.values(data));
  return (
    <div className="bar-chart">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="bar-col">
          <div className="bar-val">{val}</div>
          <div className="bar" style={{
            height: `${Math.max((val / max) * 100, 5)}%`,
            background: colorFn ? colorFn(key) : 'linear-gradient(to top, var(--indigo), var(--cyan))',
          }} title={`${key}: ${val}`} />
          <div className="bar-key" title={key}>{key.replace('_', '\n')}</div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = 'indigo' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    API.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const statusColor = (key) => {
    const map = { PAID: 'var(--emerald)', APPROVED: 'var(--blue)', PENDING: 'var(--amber)', REJECTED: 'var(--rose)' };
    return map[key] || 'var(--indigo)';
  };

  if (loading) return (
    <div>
      <div className="page-title mb-24">📊 Analytics Dashboard</div>
      <div className="stats-grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="stat-card indigo">
            <div className="skeleton" style={{ height: 38, width: 38, borderRadius: 8, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">📊 Analytics Dashboard</div>
          <div className="page-subtitle">Platform-wide insurance metrics and insights</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
      </div>

      {data && (
        <>
          {/* Key Metrics */}
          <div className="stats-grid mb-20">
            <StatCard icon="👥" label="Total Users" value={data.total_users} color="indigo" sub="Registered gig workers" />
            <StatCard icon="📋" label="Active Policies" value={data.active_policies} color="emerald" sub="Currently covered" />
            <StatCard icon="📝" label="Total Claims" value={data.total_claims} color="cyan" sub={`${data.pending_claims} pending`} />
            <StatCard icon="💸" label="Total Payout" value={`₹${data.total_payout?.toLocaleString()}`} color="amber" sub="Paid to users" />
            <StatCard icon="🚨" label="Fraud Count" value={data.fraud_count} color="rose" sub={`${data.fraud_rate}% fraud rate`} />
            <StatCard icon="💰" label="Premium Collected" value={`₹${data.total_premium_collected?.toLocaleString()}`} color="purple" sub="Total revenue" />
          </div>

          {/* Claim Status Breakdown */}
          <div className="grid-2 mb-20">
            <div className="card">
              <div className="card-header">
                <span className="section-title">📝 Claims by Status</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'PAID', val: data.paid_claims, color: 'emerald' },
                  { key: 'APPROVED', val: data.approved_claims, color: 'blue' },
                  { key: 'PENDING', val: data.pending_claims, color: 'amber' },
                  { key: 'REJECTED', val: data.rejected_claims, color: 'rose' },
                ].map(s => (
                  <div key={s.key}>
                    <div className="flex justify-between mb-4">
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{s.key}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.val}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: data.total_claims ? `${(s.val / data.total_claims) * 100}%` : '0%',
                        background: `var(--${s.color})`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="section-title">⚡ Event Type Distribution</span>
              </div>
              <BarChart data={data.claims_by_event} colorFn={() => 'linear-gradient(to top, var(--indigo), var(--cyan))'} />
            </div>
          </div>

          {/* Platform & Location */}
          <div className="grid-2 mb-20">
            <div className="card">
              <div className="card-header">
                <span className="section-title">🚗 Users by Platform</span>
              </div>
              <BarChart data={data.users_by_platform} colorFn={() => 'linear-gradient(to top, var(--purple), var(--indigo-light))'} />
            </div>

            <div className="card">
              <div className="card-header">
                <span className="section-title">📍 Users by Location</span>
              </div>
              <BarChart data={data.users_by_location} colorFn={() => 'linear-gradient(to top, var(--cyan), var(--emerald))'} />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card">
            <div className="section-title mb-16">💰 Financial Summary</div>
            <div className="grid-3" style={{ gap: 16 }}>
              {[
                { label: 'Total Premium Collected', val: `₹${data.total_premium_collected?.toLocaleString()}`, color: 'var(--emerald)' },
                { label: 'Total Payout Disbursed', val: `₹${data.total_payout?.toLocaleString()}`, color: 'var(--rose)' },
                { label: 'Total Coverage Liability', val: `₹${data.total_coverage_liability?.toLocaleString()}`, color: 'var(--amber)' },
              ].map(f => (
                <div key={f.label} style={{
                  padding: 16,
                  background: 'var(--bg-3)',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: f.color, letterSpacing: '-0.02em' }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

function RiskGaugeArc({ score }) {
  const r = 80;
  const cx = 100, cy = 100;
  const startAngle = 180;
  const endAngle = 0;
  const arcLen = Math.PI * r;
  const filled = score * arcLen;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const polarToXY = (angle, radius) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  const start = polarToXY(startAngle, r);
  const end = polarToXY(endAngle, r);

  const needle = polarToXY(180 - score * 180, r * 0.75);

  const color = score >= 0.7 ? '#f43f5e' : score >= 0.45 ? '#f59e0b' : '#10b981';
  const level = score >= 0.7 ? 'HIGH' : score >= 0.45 ? 'MEDIUM' : 'LOW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 200 110" style={{ width: 240, overflow: 'visible' }}>
        {/* Background arc */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="var(--bg-4)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Gradient fill */}
        <defs>
          <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <clipPath id="arcClip">
            <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
              fill="none" stroke="white" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${filled} ${arcLen}`} />
          </clipPath>
        </defs>
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="url(#riskGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLen}`}
        />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needle.x} y2={needle.y}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill={color} />

        {/* Labels */}
        <text x="22" y="106" fill="var(--text-4)" fontSize="9" fontFamily="Inter">LOW</text>
        <text x="83" y="25" fill="var(--text-4)" fontSize="9" fontFamily="Inter" textAnchor="middle">MEDIUM</text>
        <text x="165" y="106" fill="var(--text-4)" fontSize="9" fontFamily="Inter" textAnchor="end">HIGH</text>

        {/* Score text */}
        <text x={cx} y={90} fill="var(--text-1)" fontSize="22" fontWeight="800"
          textAnchor="middle" fontFamily="Inter" letterSpacing="-1">{score}</text>
      </svg>

      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <span className={`badge ${level === 'HIGH' ? 'badge-rose' : level === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'}`}
          style={{ fontSize: '0.85rem', padding: '5px 16px' }}>
          {level} RISK
        </span>
      </div>
    </div>
  );
}

export default function RiskEngine({ user }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRisk = () => {
    if (!user?.user_id) return;
    setLoading(true);
    setError('');
    API.get(`/ai/risk/${user.user_id}`)
      .then(r => setRisk(r.data))
      .catch(err => setError(err.response?.data?.detail || 'Please complete your profile first.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRisk(); }, [user]);

  const TIPS = {
    HIGH: [
      'Consider the Premium plan (₹30,000 coverage) for maximum protection.',
      'High-risk locations like Mumbai experience frequent weather events.',
      'File claims immediately after a covered event occurs.',
      'Keep your contact info updated for quick claim processing.',
    ],
    MEDIUM: [
      'Standard plan offers a good balance of coverage and premium.',
      'Weather events in your area are moderately frequent.',
      'Review your policy before monsoon season begins.',
    ],
    LOW: [
      'Your risk profile is favorable — consider the Basic plan to save on premiums.',
      'Low-risk cities have fewer weather-related disruptions.',
      'Even with low risk, having coverage ensures peace of mind.',
    ],
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">🤖 AI Risk Engine</div>
          <div className="page-subtitle">Your personalized insurance risk analysis powered by AI</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchRisk} disabled={loading}>
          {loading ? <><span className="loading-spinner" /> Analyzing…</> : '🔄 Refresh Analysis'}
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <div style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Running AI risk analysis…</div>
        </div>
      ) : error ? (
        <div>
          <div className="alert alert-warning mb-16">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            → Complete Profile First
          </button>
        </div>
      ) : risk ? (
        <>
          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            {/* Gauge */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
              <div className="label mb-16">RISK SCORE</div>
              <RiskGaugeArc score={risk.risk_score} />
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                  Based on location ({risk.location}) & platform ({risk.work_type})
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="card">
              <div className="section-title mb-16">📊 Risk Breakdown</div>

              <div style={{ marginBottom: 20 }}>
                <div className="flex justify-between mb-8">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Location Risk ({risk.location})</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{risk.location_factor}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${risk.location_factor * 100}%`,
                    background: 'linear-gradient(90deg, var(--indigo), var(--purple))',
                  }} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div className="flex justify-between mb-8">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Work Risk ({risk.work_type})</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{risk.work_type_factor}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${risk.work_type_factor * 100}%`,
                    background: 'linear-gradient(90deg, var(--cyan), var(--indigo-light))',
                  }} />
                </div>
              </div>

              <div className="info-row">
                <span className="info-key">Combined Score</span>
                <span className="info-val">{risk.risk_score} (60% loc + 40% work)</span>
              </div>
              <div className="info-row">
                <span className="info-key">Risk Level</span>
                <span className={`badge ${risk.risk_level === 'HIGH' ? 'badge-rose' : risk.risk_level === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'}`}>
                  {risk.risk_level}
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Recommended Premium</span>
                <span className="info-val" style={{ color: 'var(--emerald)' }}>₹{risk.weekly_premium}/week</span>
              </div>
            </div>
          </div>

          {/* Premium Estimate Cards */}
          <div className="card mb-20">
            <div className="section-title mb-16">💰 Premium Estimates for You</div>
            <div className="plan-grid">
              {[
                { name: 'Basic', mult: 1.0, coverage: 5000, color: 'var(--emerald)' },
                { name: 'Standard', mult: 1.5, coverage: 15000, color: 'var(--indigo-light)', popular: true },
                { name: 'Premium', mult: 2.0, coverage: 30000, color: 'var(--cyan)' },
              ].map(plan => (
                <div key={plan.name} className={`plan-card ${plan.popular ? 'popular' : ''}`}
                  style={{ cursor: 'default' }}>
                  {plan.popular && <div className="plan-popular-badge">BEST VALUE</div>}
                  <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="plan-coverage">
                    ₹{Math.round(risk.weekly_premium * plan.mult)}
                    <span>/week</span>
                  </div>
                  <div className="plan-feature">
                    <span style={{ color: 'var(--emerald)' }}>✓</span>
                    ₹{plan.coverage.toLocaleString()} coverage
                  </div>
                  <button className="btn btn-secondary btn-sm w-full mt-12"
                    onClick={() => navigate('/policies')}>
                    Buy {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tips */}
          <div className="card">
            <div className="section-title mb-16">💡 AI Recommendations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(TIPS[risk.risk_level] || []).map((tip, i) => (
                <div key={i} className="alert alert-info" style={{ gap: 10 }}>
                  <span>🤖</span>
                  <span style={{ fontSize: '0.85rem' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

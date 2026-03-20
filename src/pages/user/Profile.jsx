import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

const LOCATIONS = ['mumbai', 'delhi', 'chennai', 'bangalore', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow'];
const PLATFORMS = ['zomato', 'swiggy', 'amazon', 'flipkart', 'uber', 'ola', 'dunzo', 'blinkit', 'rapido', 'porter'];

const LOCATION_RISK = {
  mumbai: 0.85, delhi: 0.70, chennai: 0.80, bangalore: 0.45, kolkata: 0.75,
  hyderabad: 0.50, pune: 0.55, ahmedabad: 0.40, jaipur: 0.35, lucknow: 0.60,
};

export default function Profile({ user }) {
  const toast = useContext(ToastContext);
  const [profile, setProfile] = useState({ location: '', work_type: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.user_id) return;
    API.get(`/user/profile/${user.user_id}`)
      .then(r => setProfile({ location: r.data.location || '', work_type: r.data.work_type || '' }))
      .catch(() => toast('Failed to load profile.', 'error'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!profile.location || !profile.work_type) {
      toast('Please select both location and work platform.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await API.put(`/user/profile/${user.user_id}`, profile);
      toast('Profile updated successfully! 🎉', 'success');
    } catch {
      toast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const locRisk = profile.location ? LOCATION_RISK[profile.location] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Manage your personal information and work details</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Profile Form */}
        <div className="card">
          <div className="section-title mb-20">👤 Profile Details</div>

          <div className="info-row">
            <span className="info-key">Username</span>
            <span className="info-val">{user?.username}</span>
          </div>
          <div className="info-row" style={{ marginBottom: 20 }}>
            <span className="info-key">User ID</span>
            <span className="tag">#{user?.user_id}</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <div className="skeleton" style={{ height: 44, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 44, borderRadius: 8 }} />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">📍 City / Location</label>
                <select
                  className="form-select"
                  value={profile.location}
                  onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                >
                  <option value="">Select your city</option>
                  {LOCATIONS.map(l => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
                {profile.location && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginTop: 6 }}>
                    Location risk factor: <strong style={{ color: locRisk >= 0.7 ? 'var(--rose)' : locRisk >= 0.5 ? 'var(--amber)' : 'var(--emerald)' }}>{locRisk}</strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">🚗 Work Platform</label>
                <select
                  className="form-select"
                  value={profile.work_type}
                  onChange={e => setProfile(p => ({ ...p, work_type: e.target.value }))}
                >
                  <option value="">Select your platform</option>
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}
                style={{ justifyContent: 'center' }}>
                {saving ? <><span className="loading-spinner" /> Saving…</> : '💾 Save Profile'}
              </button>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="section-title mb-12">ℹ️ Why this matters</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
              Your <strong style={{ color: 'var(--indigo-light)' }}>city</strong> and{' '}
              <strong style={{ color: 'var(--cyan)' }}>work platform</strong> determine your AI risk score,
              which directly affects your weekly insurance premium.
            </p>
            <div className="alert alert-info mt-12">
              <span>💡</span>
              <span style={{ fontSize: '0.8rem' }}>
                Complete your profile to unlock AI Risk Score analysis and policy purchasing.
              </span>
            </div>
          </div>

          <div className="card">
            <div className="section-title mb-12">🏙️ Location Risk Levels</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(LOCATION_RISK)
                .sort(([,a],[,b]) => b - a)
                .map(([loc, risk]) => (
                  <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', width: 80, textTransform: 'capitalize' }}>{loc}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{
                        width: `${risk * 100}%`,
                        background: risk >= 0.7 ? 'linear-gradient(90deg, var(--rose), var(--amber))'
                          : risk >= 0.5 ? 'linear-gradient(90deg, var(--amber), var(--orange))'
                          : 'linear-gradient(90deg, var(--emerald), var(--cyan))',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', width: 30 }}>{risk}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

const CONFIG_META = {
  trigger_enabled: { label: 'Trigger Engine', desc: 'Enable/disable automatic weather event triggers', type: 'bool' },
  event_probability: { label: 'Event Probability', desc: 'Probability of a weather event occurring (0.0 – 1.0)', type: 'float' },
  trigger_interval: { label: 'Trigger Interval (secs)', desc: 'How often the event engine runs (in seconds)', type: 'number' },
  rain_threshold: { label: 'Rain Threshold', desc: 'Minimum rainfall level to trigger a heavy rain event', type: 'float' },
};

export default function AdminConfig() {
  const toast = useContext(ToastContext);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [edits, setEdits] = useState({});

  const fetchConfig = () => {
    setLoading(true);
    API.get('/admin/system-config')
      .then(r => {
        setConfig(r.data || {});
        setEdits(r.data || {});
      })
      .catch(() => toast('Failed to load config.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async (key) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await API.post('/admin/system-config', { key, value: String(edits[key]) });
      toast(`✅ Config "${key}" updated to "${edits[key]}"`, 'success');
      setConfig(c => ({ ...c, [key]: edits[key] }));
    } catch (err) {
      toast(err.response?.data?.detail || 'Update failed.', 'error');
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const isChanged = (key) => String(edits[key]) !== String(config[key]);

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">⚙️ System Configuration</div>
          <div className="page-subtitle">Control the AI trigger engine and platform parameters</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchConfig} disabled={loading}>🔄 Refresh</button>
      </div>

      <div className="alert alert-warning mb-20">
        <span>⚠️</span>
        <span>Changes to system config take effect immediately. Modify with caution.</span>
      </div>

      {loading ? (
        <div className="card">
          {[1,2,3,4].map(i => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 44, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(config).map(([key, val]) => {
            const meta = CONFIG_META[key] || { label: key, desc: '', type: 'text' };
            return (
              <div key={key} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{meta.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-4)', marginTop: 2 }}>{meta.desc}</div>
                  </div>
                  <span className="tag">{key}</span>
                </div>

                <div className="flex gap-12 items-center mt-12">
                  {meta.type === 'bool' ? (
                    <div className="flex gap-8">
                      {['true', 'false'].map(v => (
                        <button
                          key={v}
                          className={`btn btn-sm ${edits[key] === v ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setEdits(e => ({ ...e, [key]: v }))}
                        >
                          {v === 'true' ? '✅ Enabled' : '❌ Disabled'}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      type={meta.type === 'number' || meta.type === 'float' ? 'number' : 'text'}
                      step={meta.type === 'float' ? '0.01' : '1'}
                      value={edits[key] ?? val}
                      onChange={e => setEdits(ed => ({ ...ed, [key]: e.target.value }))}
                    />
                  )}

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSave(key)}
                    disabled={saving[key] || !isChanged(key)}
                  >
                    {saving[key]
                      ? <><span className="loading-spinner" style={{ width: 12, height: 12 }} /> Saving…</>
                      : isChanged(key) ? '💾 Save' : '✓ Saved'}
                  </button>
                </div>

                {isChanged(key) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--amber)', marginTop: 8 }}>
                    ⚠️ Unsaved change: <span className="font-mono">{config[key]}</span> → <span className="font-mono">{edits[key]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

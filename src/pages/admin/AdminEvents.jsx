import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

function SeverityBadge({ sev }) {
  const s = parseFloat(sev);
  if (s >= 0.7) return <span className="badge badge-rose">🔴 HIGH ({sev})</span>;
  if (s >= 0.4) return <span className="badge badge-amber">🟡 MED ({sev})</span>;
  return <span className="badge badge-emerald">🟢 LOW ({sev})</span>;
}

export default function AdminEvents() {
  const toast = useContext(ToastContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    API.get('/admin/events')
      .then(r => setEvents(r.data || []))
      .catch(() => toast('Failed to load events.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const filtered = events.filter(e =>
    !filter || e.event_type?.toLowerCase().includes(filter.toLowerCase()) ||
    e.description?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalClaims = events.reduce((s, e) => s + (e.claims_triggered || 0), 0);
  const highSev = events.filter(e => parseFloat(e.severity) >= 0.7).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">📡 Event Monitor</div>
          <div className="page-subtitle">Real-time weather events triggering insurance claims</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchEvents} disabled={loading}>🔄 Refresh</button>
      </div>

      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card indigo">
          <div className="stat-icon indigo">📡</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total Events Logged</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose">🔴</div>
          <div className="stat-value">{highSev}</div>
          <div className="stat-label">High Severity Events</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">📝</div>
          <div className="stat-value">{totalClaims}</div>
          <div className="stat-label">Claims Triggered</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header mb-16">
          <span className="section-title">Event Log (last 100)</span>
          <input className="form-input" style={{ width: 220 }} placeholder="🔍 Filter events…"
            value={filter} onChange={e => setFilter(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <h3>No events recorded</h3>
            <p>Weather events will appear here as the trigger engine runs.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Type</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Claims Triggered</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td><span className="tag">#{e.id}</span></td>
                    <td><span className="badge badge-indigo">{e.event_type?.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-3)', maxWidth: 300 }}>
                      {e.description || '—'}
                    </td>
                    <td><SeverityBadge sev={e.severity} /></td>
                    <td className="text-center">
                      <span className={`badge ${e.claims_triggered > 0 ? 'badge-amber' : 'badge-gray'}`}>
                        {e.claims_triggered}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {e.timestamp ? new Date(e.timestamp).toLocaleString('en-IN') : '—'}
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

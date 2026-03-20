import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

export default function AdminFraud() {
  const toast = useContext(ToastContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState({});

  const fetchAlerts = () => {
    setLoading(true);
    API.get('/admin/fraud-alerts')
      .then(r => setAlerts(r.data || []))
      .catch(() => toast('Failed to load fraud alerts.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const doAction = async (claimId, endpoint, label) => {
    setAction(a => ({ ...a, [`${claimId}-${label}`]: true }));
    try {
      const res = await API.post(`/admin/${endpoint}/${claimId}`);
      toast(res.data.message, 'success');
      fetchAlerts();
    } catch (err) {
      toast(err.response?.data?.detail || 'Action failed.', 'error');
    } finally {
      setAction(a => ({ ...a, [`${claimId}-${label}`]: false }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">🚨 Fraud Alerts</div>
          <div className="page-subtitle">AI-flagged claims requiring admin review</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchAlerts} disabled={loading}>🔄 Refresh</button>
      </div>

      {alerts.length > 0 && (
        <div className="alert alert-warning mb-20">
          <span>⚠️</span>
          <span><strong>{alerts.length} flagged claims</strong> require your attention. Review each claim carefully before taking action.</span>
        </div>
      )}

      <div className="card">
        <div className="section-title mb-16">🚨 Flagged Claims ({alerts.length})</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No fraud alerts</h3>
            <p>No claims have been flagged by the AI fraud detection engine.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Flagged Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a.id}>
                    <td><span className="tag">#{a.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{a.username}</td>
                    <td><span className="badge badge-indigo">{a.event_type?.replace('_', ' ')}</span></td>
                    <td className="font-mono">₹{a.amount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        a.status === 'PAID' ? 'badge-emerald' :
                        a.status === 'APPROVED' ? 'badge-blue' :
                        a.status === 'PENDING' ? 'badge-amber' : 'badge-rose'
                      }`}>{a.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div className="flex gap-4">
                        {(a.status === 'PENDING' || a.status === 'REJECTED') && (
                          <button className="btn btn-success btn-sm"
                            onClick={() => doAction(a.id, 'approve', 'approve')}
                            disabled={action[`${a.id}-approve`]}>
                            {action[`${a.id}-approve`] ? <span className="loading-spinner" style={{ width: 10, height: 10 }} /> : '✓ Override & Approve'}
                          </button>
                        )}
                        {a.status === 'PENDING' && (
                          <button className="btn btn-danger btn-sm"
                            onClick={() => doAction(a.id, 'reject', 'reject')}
                            disabled={action[`${a.id}-reject`]}>
                            {action[`${a.id}-reject`] ? <span className="loading-spinner" style={{ width: 10, height: 10 }} /> : '✕ Confirm Reject'}
                          </button>
                        )}
                      </div>
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

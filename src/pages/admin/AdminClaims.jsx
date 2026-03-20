import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

function StatusBadge({ status }) {
  const map = { PAID: 'badge-emerald', APPROVED: 'badge-blue', PENDING: 'badge-amber', REJECTED: 'badge-rose' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

export default function AdminClaims() {
  const toast = useContext(ToastContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchClaims = () => {
    setLoading(true);
    API.get('/admin/claims')
      .then(r => setClaims(r.data || []))
      .catch(() => toast('Failed to load claims.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClaims(); }, []);

  const doAction = async (claimId, endpoint, label) => {
    setAction(a => ({ ...a, [`${claimId}-${label}`]: true }));
    try {
      const res = await API.post(`/admin/${endpoint}/${claimId}`);
      toast(res.data.message || `${label} successful`, 'success');
      fetchClaims();
    } catch (err) {
      toast(err.response?.data?.detail || `${label} failed.`, 'error');
    } finally {
      setAction(a => ({ ...a, [`${claimId}-${label}`]: false }));
    }
  };

  const filtered = claims
    .filter(c => filter === 'ALL' || c.status === filter)
    .filter(c =>
      !search ||
      c.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.event_type?.toLowerCase().includes(search.toLowerCase())
    );

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'];
  const counts = {
    ALL: claims.length,
    PENDING: claims.filter(c => c.status === 'PENDING').length,
    APPROVED: claims.filter(c => c.status === 'APPROVED').length,
    PAID: claims.filter(c => c.status === 'PAID').length,
    REJECTED: claims.filter(c => c.status === 'REJECTED').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">📝 Claim Management</div>
          <div className="page-subtitle">Review, approve, reject and pay claims</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchClaims} disabled={loading}>🔄 Refresh</button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-8 mb-20" style={{ flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s} <span style={{ opacity: 0.7 }}>({counts[s]})</span>
          </button>
        ))}
        <input
          className="form-input"
          style={{ width: 200, marginLeft: 'auto' }}
          placeholder="🔍 Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No claims found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Fraud</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="tag">#{c.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{c.username}</td>
                    <td><span className="badge badge-indigo">{c.event_type?.replace('_', ' ')}</span></td>
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
                      <div className="flex gap-4">
                        {c.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm"
                              onClick={() => doAction(c.id, 'approve', 'approve')}
                              disabled={action[`${c.id}-approve`]}>
                              {action[`${c.id}-approve`] ? <span className="loading-spinner" style={{ width: 10, height: 10 }} /> : '✓ Approve'}
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => doAction(c.id, 'reject', 'reject')}
                              disabled={action[`${c.id}-reject`]}>
                              {action[`${c.id}-reject`] ? <span className="loading-spinner" style={{ width: 10, height: 10 }} /> : '✕ Reject'}
                            </button>
                          </>
                        )}
                        {c.status === 'APPROVED' && (
                          <button className="btn btn-primary btn-sm"
                            onClick={() => doAction(c.id, 'pay', 'pay')}
                            disabled={action[`${c.id}-pay`]}>
                            {action[`${c.id}-pay`] ? <span className="loading-spinner" style={{ width: 10, height: 10 }} /> : '💳 Pay'}
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

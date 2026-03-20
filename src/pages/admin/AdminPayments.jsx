import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

export default function AdminPayments() {
  const toast = useContext(ToastContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    setLoading(true);
    API.get('/admin/payments')
      .then(r => setPayments(r.data || []))
      .catch(() => toast('Failed to load payments.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const today = payments.filter(p => {
    if (!p.paid_at) return false;
    const d = new Date(p.paid_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">💳 Payment Monitor</div>
          <div className="page-subtitle">Track all processed claim payments</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchPayments} disabled={loading}>🔄 Refresh</button>
      </div>

      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card emerald">
          <div className="stat-icon emerald">💳</div>
          <div className="stat-value">{payments.length}</div>
          <div className="stat-label">Total Payments</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">💸</div>
          <div className="stat-value">₹{total.toLocaleString()}</div>
          <div className="stat-label">Total Disbursed</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan">📅</div>
          <div className="stat-value">{today.length}</div>
          <div className="stat-label">Payments Today</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title mb-16">All Payments ({payments.length})</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No payments yet</h3>
            <p>Payments are processed when approved claims are paid out.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Claim ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="tag">#{p.id}</span></td>
                    <td><span className="tag">Claim #{p.claim_id}</span></td>
                    <td className="font-mono" style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                      ₹{p.amount?.toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-emerald">✓ {p.status}</span>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
                      {p.paid_at ? new Date(p.paid_at).toLocaleString('en-IN') : '—'}
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

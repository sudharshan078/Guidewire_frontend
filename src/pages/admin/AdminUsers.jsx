import { useState, useEffect, useContext } from 'react';
import API from '../../api';
import { ToastContext } from '../../App';

export default function AdminUsers() {
  const toast = useContext(ToastContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState({});

  const fetchUsers = () => {
    setLoading(true);
    API.get('/admin/users')
      .then(r => setUsers(r.data || []))
      .catch(() => toast('Failed to load users.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBlock = async (userId, isBlocked) => {
    setAction(a => ({ ...a, [userId]: true }));
    try {
      const endpoint = isBlocked ? `/admin/unblock-user/${userId}` : `/admin/block-user/${userId}`;
      const res = await API.post(endpoint);
      toast(res.data.message, 'success');
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.detail || 'Action failed.', 'error');
    } finally {
      setAction(a => ({ ...a, [userId]: false }));
    }
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.location?.toLowerCase().includes(search.toLowerCase())
  );

  const total = users.length;
  const blocked = users.filter(u => u.is_blocked).length;
  const admins = users.filter(u => u.role === 'admin').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">👥 User Management</div>
          <div className="page-subtitle">View, manage and control platform users</div>
        </div>
        <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>🔄 Refresh</button>
      </div>

      <div className="stats-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card indigo">
          <div className="stat-icon indigo">👥</div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose">🚫</div>
          <div className="stat-value">{blocked}</div>
          <div className="stat-label">Blocked Users</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber">🔐</div>
          <div className="stat-value">{admins}</div>
          <div className="stat-label">Admin Accounts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header mb-16">
          <span className="section-title">All Users</span>
          <input
            className="form-input"
            style={{ width: 240 }}
            placeholder="🔍 Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 50, borderRadius: 8 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>{search ? 'No matches found' : 'No users yet'}</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Platform</th>
                  <th>Role</th>
                  <th>Policies</th>
                  <th>Claims</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td><span className="tag">#{u.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{u.email}</td>
                    <td>{u.location || <span className="text-muted">—</span>}</td>
                    <td>{u.work_type || <span className="text-muted">—</span>}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-rose' : 'badge-indigo'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-center">{u.policy_count}</td>
                    <td className="text-center">{u.claim_count}</td>
                    <td>
                      {u.is_blocked
                        ? <span className="badge badge-rose">🚫 Blocked</span>
                        : <span className="badge badge-emerald">✓ Active</span>}
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`btn btn-sm ${u.is_blocked ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleBlock(u.id, u.is_blocked)}
                          disabled={action[u.id]}
                        >
                          {action[u.id]
                            ? <span className="loading-spinner" style={{ width: 12, height: 12 }} />
                            : u.is_blocked ? '✓ Unblock' : '🚫 Block'}
                        </button>
                      )}
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

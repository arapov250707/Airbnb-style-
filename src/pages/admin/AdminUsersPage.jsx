import { useEffect, useState } from 'react';
import { userService } from '../../services/api';
import { useNotification } from '../../context/AppContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Trash2, Shield, User, Home } from 'lucide-react';
import styles from './AdminPages.module.css';

const ROLE_COLORS = { admin: '#c4622d', host: '#5a7a5e', guest: '#3b82f6' };
const ROLE_ICONS = { admin: Shield, host: Home, guest: User };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState('');
  const { add } = useNotification();

  useEffect(() => {
    userService.getAll().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await userService.delete(confirmId);
      setUsers(u => u.filter(x => x.id !== confirmId));
      add('User deleted', 'success');
    } catch (err) { add(err.message, 'error'); }
    setConfirmId(null);
  };

  const changeRole = async (id, role) => {
    try {
      await userService.updateRole(id, role);
      setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
      add('Role updated', 'success');
    } catch (err) { add(err.message, 'error'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Users</h1>
          <p className={styles.pageSubtitle}>{users.length} registered users</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>All Users</h3>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…" className="form-input"
            style={{ width: 260 }}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const RoleIcon = ROLE_ICONS[u.role] || User;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userRow}>
                        <img src={u.avatar} className={styles.userAvatar} alt="" />
                        <div className={styles.userInfo}>
                          <strong>{u.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: `${ROLE_COLORS[u.role]}18`,
                          color: ROLE_COLORS[u.role],
                        }}>
                          <RoleIcon size={11} /> {u.role}
                        </span>
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          className="form-input"
                          style={{ padding: '3px 8px', fontSize: 12, width: 'auto', borderRadius: 6 }}
                        >
                          <option value="guest">guest</option>
                          <option value="host">host</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{u.joined}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmId(u.id)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><h3>No users found</h3></div>}
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? All their data will be removed."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
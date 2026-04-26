import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/api';
import { useNotification } from '../../context/AppContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import styles from './AdminPages.module.css';

export default function AdminPropertiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState('');
  const { add } = useNotification();

  useEffect(() => {
    propertyService.getAll({ limit: 100 })
      .then(d => setItems(d.items))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await propertyService.delete(confirmId);
      setItems(i => i.filter(x => x.id !== confirmId));
      add('Property deleted', 'success');
    } catch (err) { add(err.message, 'error'); }
    setConfirmId(null);
  };

  const filtered = items.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Properties</h1>
          <p className={styles.pageSubtitle}>{items.length} total listings</p>
        </div>
        <Link to="/properties/create" className="btn btn-primary btn-sm">
          <Plus size={15} /> Add Property
        </Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>All Properties</h3>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search properties…" className="form-input"
            style={{ width: 260 }}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Location</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.images[0]} className={styles.propImg} alt="" />
                      <div className={styles.propInfo}>
                        <strong>{p.title}</strong>
                        <span>by {p.hostName}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">{p.type}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{p.location}</td>
                  <td><strong style={{ color: 'var(--rust)' }}>${p.price}</strong><span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>/night</span></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13 }}>
                      <Star size={12} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                      {p.rating}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/properties/${p.id}`} className="btn btn-ghost btn-sm">View</Link>
                      <Link to={`/properties/${p.id}/edit`} className="btn btn-secondary btn-sm">
                        <Pencil size={13} />
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(p.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><h3>No properties found</h3></div>
          )}
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          message="Are you sure you want to delete this property? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { bookingService } from '../../services/api';
import { useNotification } from '../../context/AppContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Trash2, Calendar } from 'lucide-react';
import styles from './AdminPages.module.css';

const STATUS_OPTS = ['pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_CLASS = { confirmed: 'badge-success', pending: 'badge-warning', completed: 'badge-info', cancelled: 'badge-danger' };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { add } = useNotification();

  useEffect(() => {
    bookingService.getAll().then(setBookings).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      setBookings(b => b.map(x => x.id === id ? { ...x, status } : x));
      add('Status updated', 'success');
    } catch (err) { add(err.message, 'error'); }
  };

  const handleDelete = async () => {
    try {
      await bookingService.delete(confirmId);
      setBookings(b => b.filter(x => x.id !== confirmId));
      add('Booking deleted', 'success');
    } catch (err) { add(err.message, 'error'); }
    setConfirmId(null);
  };

  const filtered = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const totalRevenue = filtered
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + b.totalPrice, 0);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bookings</h1>
          <p className={styles.pageSubtitle}>{bookings.length} total · Revenue: ${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>All Bookings</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', ...STATUS_OPTS].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: '1.5px solid var(--card-border)',
                  background: filterStatus === s ? 'var(--rust)' : 'var(--card)',
                  color: filterStatus === s ? '#fff' : 'var(--ink-soft)',
                  cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Property</th>
                <th><Calendar size={13} style={{ verticalAlign: 'middle' }} /> Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500, fontSize: 14 }}>{b.guestName}</td>
                  <td style={{ fontSize: 13, color: 'var(--ink-muted)' }}>#{b.propertyId}</td>
                  <td style={{ fontSize: 13 }}>{b.checkIn}</td>
                  <td style={{ fontSize: 13 }}>{b.checkOut}</td>
                  <td style={{ fontSize: 13 }}>{b.guests}</td>
                  <td><strong style={{ color: 'var(--rust)' }}>${b.totalPrice.toLocaleString()}</strong></td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[b.status] || 'badge-neutral'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: 12, width: 'auto', borderRadius: 6 }}
                      >
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(b.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><h3>No bookings found</h3></div>}
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          title="Delete Booking"
          message="Are you sure you want to delete this booking?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
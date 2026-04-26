import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, PlusCircle, Building2 } from 'lucide-react';
import { bookingService, propertyService } from '../services/api';
import { useAuth, useNotification } from '../context/Appcontext';
import ConfirmModal from '../components/common/ConfirmModal';
import styles from './DashboardPage.module.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', class: 'badge-warning', icon: Clock },
  confirmed: { label: 'Confirmed', class: 'badge-success', icon: CheckCircle },
  completed: { label: 'Completed', class: 'badge-info', icon: CheckCircle },
  cancelled: { label: 'Cancelled', class: 'badge-danger', icon: XCircle },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { add } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    Promise.all([
      bookingService.getByUser(user.id),
      propertyService.getAll({ limit: 100 }),
    ]).then(([bk, pr]) => {
      setBookings(bk);
      setProperties(pr.items.filter(p => p.hostId === user.id));
    }).finally(() => setLoading(false));
  }, [user.id]);

  const cancelBooking = async () => {
    try {
      await bookingService.updateStatus(confirmId, 'cancelled');
      setBookings(b => b.map(x => x.id === confirmId ? { ...x, status: 'cancelled' } : x));
      add('Booking cancelled', 'success');
    } catch (err) { add(err.message, 'error'); }
    setConfirmId(null);
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: '#c4622d' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#5a7a5e' },
    { label: 'Total Spent', value: `$${bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}`, color: '#c9a84c' },
    { label: 'My Listings', value: properties.length, color: '#3b82f6' },
  ];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className="section-title">Welcome, {user.name.split(' ')[0]} 👋</h1>
            <p className="section-subtitle">Manage your bookings and listings</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(user.role === 'host' || user.role === 'admin') && (
              <Link to="/properties/create" className="btn btn-primary btn-sm"><PlusCircle size={15} /> List Property</Link>
            )}
            <Link to="/properties" className="btn btn-secondary btn-sm">Explore</Link>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>My Bookings</h2>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <Calendar />
              <h3>No bookings yet</h3>
              <p>Start exploring and book your first stay!</p>
              <Link to="/properties" className="btn btn-primary" style={{ marginTop: 16 }}>Browse properties</Link>
            </div>
          ) : (
            <div className={styles.bookingList}>
              {bookings.map(b => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <div key={b.id} className={styles.bookingCard}>
                    <div className={styles.bookingInfo}>
                      <div className={styles.bookingDates}>
                        <Calendar size={14} />
                        <span>{b.checkIn}</span> → <span>{b.checkOut}</span>
                        <span className={styles.bookingNights}>
                          ({Math.round((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000)} nights)
                        </span>
                      </div>
                      <div className={styles.bookingMeta}>
                        <span><MapPin size={12} /> Property #{b.propertyId}</span>
                        <span>{b.guests} guests</span>
                      </div>
                    </div>
                    <div className={styles.bookingRight}>
                      <span className={`badge ${cfg.class}`}><Icon size={12} /> {cfg.label}</span>
                      <strong className={styles.bookingPrice}>${b.totalPrice.toLocaleString()}</strong>
                      {b.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#dc2626' }} onClick={() => setConfirmId(b.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* My listings */}
        {properties.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Listings</h2>
              <Link to="/properties/create" className="btn btn-secondary btn-sm"><PlusCircle size={14} /> Add New</Link>
            </div>
            <div className={styles.listingGrid}>
              {properties.map(p => (
                <div key={p.id} className={styles.listingCard}>
                  <img src={p.images[0]} alt={p.title} className={styles.listingImg} />
                  <div className={styles.listingBody}>
                    <h4>{p.title}</h4>
                    <p><MapPin size={12} /> {p.location}</p>
                    <div className={styles.listingFooter}>
                      <span><strong>${p.price}</strong>/night</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/properties/${p.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        <Link to={`/properties/${p.id}`} className="btn btn-ghost btn-sm">View</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {confirmId && (
        <ConfirmModal
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking?"
          onConfirm={cancelBooking}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

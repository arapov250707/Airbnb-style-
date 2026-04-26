import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, Users, Bed, Bath, Wifi, Check, ChevronLeft, Calendar, Edit, Trash2 } from 'lucide-react';
import { propertyService, bookingService } from '../services/api';
import { useAuth, useNotification } from '../context/Appcontext';
import { useForm } from '../hooks/index';
import ConfirmModal from '../components/common/ConfirmModal';
import styles from './PropertyDetailPage.module.css';

function validateBooking(v) {
  const errors = {};
  if (!v.checkIn) errors.checkIn = 'Required';
  if (!v.checkOut) errors.checkOut = 'Required';
  if (v.checkIn && v.checkOut && v.checkIn >= v.checkOut) errors.checkOut = 'Check-out must be after check-in';
  if (!v.guests || v.guests < 1) errors.guests = 'At least 1 guest';
  return errors;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useNotification();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [confirm, setConfirm] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } = useForm(
    { checkIn: '', checkOut: '', guests: 1 }, validateBooking
  );

  useEffect(() => {
    propertyService.getById(id)
      .then(setProperty)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = values.checkIn && values.checkOut
    ? Math.max(0, Math.round((new Date(values.checkOut) - new Date(values.checkIn)) / 86400000))
    : 0;

  const onBook = handleSubmit(async (vals) => {
    if (!user) { add('Please sign in to book', 'error'); navigate('/login'); return; }
    try {
      await bookingService.create({
        propertyId: id,
        userId: user.id,
        guestName: user.name,
        checkIn: vals.checkIn,
        checkOut: vals.checkOut,
        guests: Number(vals.guests),
        totalPrice: nights * property.price,
      });
      add('Booking request sent! 🎉', 'success');
      navigate('/dashboard');
    } catch (err) {
      add(err.message, 'error');
    }
  });

  const handleDelete = async () => {
    try {
      await propertyService.delete(id);
      add('Property deleted', 'success');
      navigate('/properties');
    } catch (err) {
      add(err.message, 'error');
    }
  };

  const canEdit = user && (user.id === property?.hostId || user.role === 'admin');

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error) return <div className="empty-state"><h3>Property not found</h3><Link to="/properties" className="btn btn-primary" style={{ marginTop: 16 }}>Back to listings</Link></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm"><ChevronLeft size={15} /> Back</button>
          <span>{property.location}</span>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{property.title}</h1>
            <div className={styles.headerMeta}>
              <span><span className="stars">★</span> {property.rating} ({property.reviewCount} reviews)</span>
              <span><MapPin size={13} /> {property.location}</span>
            </div>
          </div>
          {canEdit && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/properties/${id}/edit`} className="btn btn-secondary btn-sm"><Edit size={14} /> Edit</Link>
              <button className="btn btn-danger btn-sm" onClick={() => setConfirm(true)}><Trash2 size={14} /> Delete</button>
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <img src={property.images[imgIdx]} alt={property.title} />
          </div>
          {property.images.length > 1 && (
            <div className={styles.thumbs}>
              {property.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`${styles.thumb} ${i === imgIdx ? styles.thumbActive : ''}`}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.layout}>
          {/* Main */}
          <div className={styles.main}>
            <div className={styles.hostRow}>
              <div>
                <h2 className={styles.hostedBy}>Hosted by {property.hostName}</h2>
                <p className={styles.hostedSince}>Host since {property.hosted}</p>
              </div>
              <div className={styles.specs}>
                <span><Users size={15} /> {property.guests} guests</span>
                <span><Bed size={15} /> {property.bedrooms} bedrooms</span>
                <span><Bath size={15} /> {property.bathrooms} baths</span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.description}>
              <h3>About this place</h3>
              <p>{property.description}</p>
            </div>

            <div className={styles.divider} />

            <div className={styles.amenities}>
              <h3>What this place offers</h3>
              <div className={styles.amenityGrid}>
                {property.amenities.map(a => (
                  <div key={a} className={styles.amenityItem}>
                    <Check size={15} className={styles.amenityCheck} /> {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className={styles.sideCard}>
            <div className={styles.bookCard}>
              <div className={styles.bookPrice}>
                <strong>${property.price}</strong> <span>/ night</span>
              </div>
              <div className={styles.bookRating}>
                <span className="stars">★</span> {property.rating} · {property.reviewCount} reviews
              </div>

              <form onSubmit={onBook} className={styles.bookForm} noValidate>
                <div className={styles.dateRow}>
                  <div className="form-group">
                    <label className="form-label">Check-in</label>
                    <input type="date" name="checkIn" value={values.checkIn}
                      onChange={handleChange} onBlur={handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                      className={`form-input ${touched.checkIn && errors.checkIn ? 'error' : ''}`} />
                    {touched.checkIn && errors.checkIn && <span className="form-error">{errors.checkIn}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-out</label>
                    <input type="date" name="checkOut" value={values.checkOut}
                      onChange={handleChange} onBlur={handleBlur}
                      min={values.checkIn || new Date().toISOString().split('T')[0]}
                      className={`form-input ${touched.checkOut && errors.checkOut ? 'error' : ''}`} />
                    {touched.checkOut && errors.checkOut && <span className="form-error">{errors.checkOut}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guests</label>
                  <input type="number" name="guests" value={values.guests}
                    min={1} max={property.guests}
                    onChange={handleChange} onBlur={handleBlur}
                    className={`form-input ${touched.guests && errors.guests ? 'error' : ''}`} />
                  {touched.guests && errors.guests && <span className="form-error">{errors.guests}</span>}
                </div>

                {nights > 0 && (
                  <div className={styles.priceBreakdown}>
                    <div className={styles.priceRow}><span>${property.price} × {nights} nights</span><span>${property.price * nights}</span></div>
                    <div className={styles.priceRow}><span>Service fee</span><span>${Math.round(property.price * nights * 0.12)}</span></div>
                    <div className={`${styles.priceRow} ${styles.priceTotal}`}><span>Total</span><span>${property.price * nights + Math.round(property.price * nights * 0.12)}</span></div>
                  </div>
                )}

                <button type="submit" className={`btn btn-primary btn-lg ${styles.bookBtn}`} disabled={submitting}>
                  {submitting ? 'Booking…' : nights > 0 ? `Book for $${property.price * nights}` : 'Request to book'}
                </button>
                <p className={styles.bookNote}>You won't be charged yet</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={`Are you sure you want to delete "${property.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}

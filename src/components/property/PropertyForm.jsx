import { useForm } from '../../hooks/index';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import styles from './PropertyForm.module.css';

const AMENITY_OPTIONS = ['WiFi', 'Kitchen', 'Pool', 'Parking', 'Gym', 'AC', 'Fireplace', 'BBQ', 'Breakfast Included', 'Washer', 'TV', 'Hot Tub', 'Beach Access', 'Mountain View', 'City View'];

function validate(values) {
  const errors = {};
  if (!values.title || values.title.trim().length < 5) errors.title = 'Title must be at least 5 characters';
  if (!values.location || values.location.trim().length < 3) errors.location = 'Location is required';
  if (!values.price || values.price <= 0) errors.price = 'Price must be greater than 0';
  if (!values.description || values.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
  if (!values.type) errors.type = 'Select a property type';
  if (!values.guests || values.guests < 1) errors.guests = 'At least 1 guest';
  if (!values.bedrooms || values.bedrooms < 1) errors.bedrooms = 'At least 1 bedroom';
  if (!values.bathrooms || values.bathrooms < 1) errors.bathrooms = 'At least 1 bathroom';
  return errors;
}

export default function PropertyForm({ initialValues, onSubmit, submitLabel = 'Save Property' }) {
  const defaults = {
    title: '', location: '', price: '', type: 'apartment',
    guests: 2, bedrooms: 1, bathrooms: 1, description: '',
    imageUrl: '', amenities: [],
    ...initialValues,
  };

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, setValues } = useForm(defaults, validate);
  const [newAmenity, setNewAmenity] = useState('');

  const toggleAmenity = (a) => {
    setValues(v => ({
      ...v,
      amenities: v.amenities.includes(a) ? v.amenities.filter(x => x !== a) : [...v.amenities, a]
    }));
  };

  const addCustomAmenity = () => {
    if (newAmenity.trim() && !values.amenities.includes(newAmenity.trim())) {
      setValues(v => ({ ...v, amenities: [...v.amenities, newAmenity.trim()] }));
      setNewAmenity('');
    }
  };

  const submitted = handleSubmit(async (vals) => {
    const images = vals.imageUrl ? [vals.imageUrl] : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'];
    await onSubmit({ ...vals, images, price: Number(vals.price), guests: Number(vals.guests), bedrooms: Number(vals.bedrooms), bathrooms: Number(vals.bathrooms) });
  });

  const Field = ({ name, label, type = 'text', placeholder, ...rest }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} name={name} value={values[name]} onChange={handleChange} onBlur={handleBlur}
        placeholder={placeholder}
        className={`form-input ${touched[name] && errors[name] ? 'error' : ''}`} {...rest} />
      {touched[name] && errors[name] && <span className="form-error">⚠ {errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={submitted} noValidate>
      <div className={styles.grid2}>
        <Field name="title" label="Property Title" placeholder="Cozy Downtown Apartment" />
        <Field name="location" label="Location" placeholder="City, Country" />
      </div>

      <div className={styles.grid4}>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select name="type" value={values.type} onChange={handleChange} className="form-input">
            {['apartment','house','villa','cabin','unique'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
        <Field name="price" label="Price / night ($)" type="number" placeholder="150" min="1" />
        <Field name="guests" label="Max Guests" type="number" min="1" />
        <Field name="bedrooms" label="Bedrooms" type="number" min="1" />
        <Field name="bathrooms" label="Bathrooms" type="number" min="1" />
      </div>

      <div className="form-group" style={{ marginTop: 4 }}>
        <label className="form-label">Description</label>
        <textarea name="description" value={values.description} onChange={handleChange} onBlur={handleBlur} rows={4}
          placeholder="Describe your property…"
          className={`form-input ${touched.description && errors.description ? 'error' : ''}`}
          style={{ resize: 'vertical' }} />
        {touched.description && errors.description && <span className="form-error">⚠ {errors.description}</span>}
      </div>

      <Field name="imageUrl" label="Main Image URL" placeholder="https://images.unsplash.com/…" />
      <span className="form-hint">Leave blank to use a default image</span>

      <div className={styles.amenitiesSection}>
        <label className="form-label">Amenities</label>
        <div className={styles.amenityChips}>
          {AMENITY_OPTIONS.map(a => (
            <button type="button" key={a} onClick={() => toggleAmenity(a)}
              className={`${styles.chip} ${values.amenities.includes(a) ? styles.chipActive : ''}`}>
              {a}
            </button>
          ))}
        </div>
        <div className={styles.customAmenity}>
          <input type="text" value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
            placeholder="Add custom amenity…" className="form-input"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomAmenity}><Plus size={14} /></button>
        </div>
        {values.amenities.length > 0 && (
          <div className={styles.selectedAmenities}>
            {values.amenities.filter(a => !AMENITY_OPTIONS.includes(a)).map(a => (
              <span key={a} className={styles.customTag}>
                {a} <button type="button" onClick={() => toggleAmenity(a)}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
import { useState } from 'react';
import { useAuth, useNotification } from '../context/Appcontext';
import { authService } from '../services/api';
import { useForm } from '../hooks/index';
import { User, Mail, Phone, FileText, Camera } from 'lucide-react';
import styles from './ProfilePage.module.css';

function validate(v) {
  const errors = {};
  if (!v.name || v.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (v.phone && !/^[+\d\s\-()]{7,20}$/.test(v.phone)) errors.phone = 'Invalid phone number';
  return errors;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { add } = useNotification();
  const [saved, setSaved] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } = useForm(
    { name: user.name, phone: user.phone || '', bio: user.bio || '', avatar: user.avatar || '' },
    validate
  );

  const onSubmit = handleSubmit(async (vals) => {
    try {
      const updated = await authService.updateProfile(user.id, vals);
      updateUser(updated);
      add('Profile updated!', 'success');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      add(err.message, 'error');
    }
  });

  const ROLE_COLORS = { admin: '#c4622d', host: '#5a7a5e', guest: '#3b82f6' };

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 28 }}>My Profile</h1>

        <div className={styles.layout}>
          {/* Left: avatar card */}
          <div className={styles.avatarCard}>
            <div className={styles.avatarWrapper}>
              <img src={values.avatar || user.avatar} alt={user.name} className={styles.avatar} />
              <div className={styles.avatarOverlay}><Camera size={20} /></div>
            </div>
            <h2 className={styles.profileName}>{user.name}</h2>
            <span className="badge" style={{ background: `${ROLE_COLORS[user.role]}20`, color: ROLE_COLORS[user.role] }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <div className={styles.profileMeta}>
              <div><Mail size={13} /> {user.email}</div>
              <div><User size={13} /> Member since {user.joined}</div>
            </div>
          </div>

          {/* Right: edit form */}
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Edit Information</h3>

            <form onSubmit={onSubmit} noValidate>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                    className={`form-input ${touched.name && errors.name ? 'error' : ''}`} />
                  {touched.name && errors.name && <span className="form-error">⚠ {errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur}
                    placeholder="+1 (555) 123-4567"
                    className={`form-input ${touched.phone && errors.phone ? 'error' : ''}`} />
                  {touched.phone && errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Avatar URL</label>
                <input type="url" name="avatar" value={values.avatar} onChange={handleChange}
                  placeholder="https://…" className="form-input" />
                <span className="form-hint">Paste an image URL or use pravatar.cc</span>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Bio</label>
                <textarea name="bio" value={values.bio} onChange={handleChange} rows={4}
                  placeholder="Tell guests a little about yourself…"
                  className="form-input" style={{ resize: 'vertical' }} />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <div className={styles.readonlyInfo}>
                  <span><Mail size={13} /> {user.email}</span>
                  <span className="form-hint">Email cannot be changed</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

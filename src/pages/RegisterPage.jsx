import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '../context/Appcontext';
import { useForm } from '../hooks/index';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';

function validate(values) {
  const errors = {};
  if (!values.name || values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!values.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Min 6 characters';
  if (values.confirm !== values.password) errors.confirm = 'Passwords do not match';
  return errors;
}

const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px 11px 40px', borderRadius: 8,
  border: `1.5px solid ${hasError ? '#dc2626' : 'var(--card-border)'}`,
  background: 'var(--card)', color: 'var(--ink)', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
});

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  color: 'var(--ink-muted)', marginBottom: 6,
};

export default function RegisterPage() {
  const { register } = useAuth();
  const { add } = useNotification();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } = useForm(
    { name: '', email: '', password: '', confirm: '' }, validate
  );

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await register({ name: vals.name, email: vals.email, password: vals.password });
      add('Account created! Welcome 🎉', 'success');
      navigate('/dashboard');
    } catch (err) { add(err.message, 'error'); }
  });

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: <User size={16}/>, placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', icon: <Mail size={16}/>, placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: showPw ? 'text' : 'password', icon: <Lock size={16}/>, placeholder: '••••••••', eye: true },
    { name: 'confirm', label: 'Confirm Password', type: showPw ? 'text' : 'password', icon: <Lock size={16}/>, placeholder: '••••••••', eye: true },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--sand)' }}>
      <div style={{ display: 'flex', maxWidth: 900, width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: '1px solid var(--card-border)' }}>

        {/* Left */}
        <div style={{ flex: '0 0 360px', background: 'linear-gradient(150deg,#1a1208 0%,#2d1f0e 60%,#1a1208 100%)', padding: '52px 44px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,98,45,0.3),transparent 70%)' }} />
          <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.2),transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3rem', color: '#e07840', marginBottom: 24 }}>⌂</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 300, color: '#f5f0e8', marginBottom: 12, lineHeight: 1.3 }}>Join StayHaven</h2>
            <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7 }}>List your property or discover unique stays around the world.</p>
            <ul style={{ listStyle: 'none', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['✓ Free to join', '✓ List your property', '✓ Book with confidence'].map(t => (
                <li key={t} style={{ color: 'rgba(245,240,232,0.8)', fontSize: 14 }}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: form */}
        <div style={{ flex: 1, background: 'var(--card)', padding: '52px 48px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>Create account</h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Already have one? <Link to="/login" style={{ color: 'var(--rust)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            {fields.map(f => (
              <div key={f.name} style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>{f.icon}</span>
                  <input type={f.type} name={f.name} value={values[f.name]} onChange={handleChange} onBlur={handleBlur} placeholder={f.placeholder}
                    style={{ ...inputStyle(touched[f.name] && errors[f.name]), paddingRight: f.eye ? 40 : 14 }} />
                  {f.eye && (
                    <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {touched[f.name] && errors[f.name] && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4, display: 'block' }}>⚠ {errors[f.name]}</span>}
              </div>
            ))}

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'var(--rust)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, opacity: submitting ? 0.7 : 1 }}>
              <UserPlus size={17} /> {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

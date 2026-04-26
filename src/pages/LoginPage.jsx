import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useNotification } from '../context/AppContext';
import { useForm } from '../hooks/index';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

function validate(values) {
  const errors = {};
  if (!values.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email address';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Minimum 6 characters';
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { add } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [showPw, setShowPw] = useState(false);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, setValues } = useForm(
    { email: '', password: '' }, validate
  );

  const fillDemo = (role) => {
    const demos = { admin: { email: 'admin@stayhaven.com', password: 'admin123' }, host: { email: 'emma@example.com', password: 'user123' }, guest: { email: 'guest@example.com', password: 'user123' } };
    setValues(demos[role]);
  };

  const onSubmit = handleSubmit(async (vals) => {
    try { await login(vals.email, vals.password); add('Welcome back!', 'success'); navigate(from, { replace: true }); }
    catch (err) { add(err.message, 'error'); }
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--sand)' }}>
      <div style={{ display: 'flex', maxWidth: 900, width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', border: '1px solid var(--card-border)' }}>

        {/* Left panel */}
        <div style={{ flex: '0 0 360px', background: 'linear-gradient(150deg,#1a1208 0%,#2d1f0e 60%,#1a1208 100%)', padding: '52px 44px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,98,45,0.3),transparent 70%)' }} />
          <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.2),transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3rem', color: '#e07840', marginBottom: 24 }}>⌂</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 300, color: '#f5f0e8', marginBottom: 12, lineHeight: 1.3 }}>Welcome back to StayHaven</h2>
            <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7 }}>Your next great stay is just a click away.</p>
          </div>
        </div>

        {/* Right: form */}
        <div style={{ flex: 1, background: 'var(--card)', padding: '52px 48px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>Sign in</h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>New here? <Link to="/register" style={{ color: 'var(--rust)', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link></p>
          </div>

          {/* Demo buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--sand-deep)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-muted)' }}>Quick demo:</span>
            {['admin','host','guest'].map(r => (
              <button key={r} type="button" onClick={() => fillDemo(r)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 13, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink-soft)', cursor: 'pointer' }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none' }} />
                <input type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com"
                  style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 8, border: `1.5px solid ${touched.email && errors.email ? '#dc2626' : 'var(--card-border)'}`, background: 'var(--card)', color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {touched.email && errors.email && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4, display: 'block' }}>⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} name="password" value={values.password} onChange={handleChange} onBlur={handleBlur} placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 40px 11px 40px', borderRadius: 8, border: `1.5px solid ${touched.password && errors.password ? '#dc2626' : 'var(--card-border)'}`, background: 'var(--card)', color: 'var(--ink)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && <span style={{ fontSize: 12, color: '#dc2626', marginTop: 4, display: 'block' }}>⚠ {errors.password}</span>}
            </div>

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'var(--rust)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}>
              <LogIn size={17} /> {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
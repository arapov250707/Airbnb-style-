import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center',
    }}>
      <div>
        <div style={{ fontSize: '5rem', marginBottom: 16, lineHeight: 1 }}>⌂</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,8vw,6rem)',
          fontWeight: 300, color: 'var(--ink)', marginBottom: 8, lineHeight: 1,
        }}>
          404
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '1.4rem',
          fontWeight: 300, color: 'var(--ink-soft)', marginBottom: 12,
        }}>
          Page not found
        </p>
        <p style={{ color: 'var(--ink-muted)', fontSize: 15, marginBottom: 32, maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            ← Go Back
          </button>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link to="/properties" className="btn btn-secondary">
            Explore Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
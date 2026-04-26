import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useTheme } from '../context/AppContext';
import { Moon, Sun, Menu, X, LogOut, LayoutDashboard, Shield, PlusCircle, User, Globe } from 'lucide-react';

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        padding: '8px 16px',
        borderRadius: 24,
        fontSize: 14,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
        background: isActive ? 'var(--sand-deep)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
      })}
    >
      {children}
    </NavLink>
  );
}

function DropLink({ to, icon, children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', fontSize: 14,
        color: hovered ? 'var(--ink)' : 'var(--ink-soft)',
        background: hovered ? 'var(--sand-deep)' : 'transparent',
        textDecoration: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  const mobileLinks = user
    ? [
        { to: '/', label: 'Home' },
        { to: '/properties', label: 'Explore' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/profile', label: 'Profile' },
        ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/properties', label: 'Explore' },
        { to: '/login', label: 'Sign in' },
        { to: '/register', label: 'Join free' },
      ];

  const footerCols = [
    {
      title: 'Explore',
      links: [
        { to: '/properties', label: 'All Properties' },
        { to: '/register', label: 'Become a Host' },
      ],
    },
    {
      title: 'Account',
      links: [
        { to: '/login', label: 'Sign In' },
        { to: '/register', label: 'Register' },
        { to: '/dashboard', label: 'Dashboard' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '#', label: 'About Us' },
        { to: '#', label: 'Help Center' },
        { to: '#', label: 'Careers' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ─── HEADER ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'var(--card)',
        borderBottom: '1px solid var(--card-border)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 32px', height: 72,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}>

          {/* Logo */}
          <Link to="/" style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--rust)', textDecoration: 'none', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ⌂ StayHaven
          </Link>

          {/* Center nav — hidden on mobile */}
          <nav style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <NavItem to="/" end>Home</NavItem>
            <NavItem to="/properties">Explore</NavItem>
            {user && <NavItem to="/dashboard">Dashboard</NavItem>}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {user && (user.role === 'host' || user.role === 'admin') && (
              <Link
                to="/properties/create"
                style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)',
                  padding: '8px 14px', borderRadius: 24,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                List your property
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                border: 'none', background: 'transparent',
                color: 'var(--ink-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user ? (
              /* Logged-in pill */
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(d => !d)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '5px 6px 5px 14px',
                    border: '1.5px solid var(--card-border)',
                    borderRadius: 28, background: 'var(--card)',
                    cursor: 'pointer',
                    boxShadow: dropOpen ? '0 2px 10px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <Menu size={15} style={{ color: 'var(--ink-soft)' }} />
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                  />
                </button>

                {dropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    background: 'var(--card)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 16,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                    minWidth: 240, zIndex: 300,
                    overflow: 'hidden',
                  }}>
                    {/* User info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px' }}>
                      <img
                        src={user.avatar}
                        alt=""
                        style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </div>
                        <span style={{
                          display: 'inline-block', marginTop: 4,
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: 'rgba(196,98,45,0.12)', color: 'var(--rust)',
                          padding: '1px 8px', borderRadius: 10,
                        }}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div style={{ height: 1, background: 'var(--card-border)' }} />

                    <DropLink to="/profile" icon={<User size={14} />} onClick={() => setDropOpen(false)}>
                      Profile
                    </DropLink>
                    <DropLink to="/dashboard" icon={<LayoutDashboard size={14} />} onClick={() => setDropOpen(false)}>
                      Dashboard
                    </DropLink>

                    {(user.role === 'host' || user.role === 'admin') && (
                      <DropLink to="/properties/create" icon={<PlusCircle size={14} />} onClick={() => setDropOpen(false)}>
                        List Property
                      </DropLink>
                    )}

                    {user.role === 'admin' && (
                      <DropLink to="/admin" icon={<Shield size={14} />} onClick={() => setDropOpen(false)}>
                        Admin Panel
                      </DropLink>
                    )}

                    <div style={{ height: 1, background: 'var(--card-border)' }} />

                    <LogoutButton onClick={handleLogout} />
                  </div>
                )}
              </div>
            ) : (
              /* Guest */
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 14px', borderRadius: 24,
                    fontSize: 14, fontWeight: 600,
                    color: 'var(--ink)', textDecoration: 'none',
                  }}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '9px 18px', borderRadius: 24,
                    fontSize: 14, fontWeight: 600,
                    background: 'var(--rust)', color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  Join free
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(m => !m)}
              style={{
                display: 'none',
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: 'transparent',
                color: 'var(--ink)', cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center',
              }}
              className="sh-mobile-toggle"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid var(--card-border)',
            padding: '12px 24px 16px',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {mobileLinks.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '10px 12px', borderRadius: 8,
                  fontSize: 15, fontWeight: 500,
                  color: 'var(--ink-soft)', textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 12px', borderRadius: 8,
                  fontSize: 15, fontWeight: 500, color: '#e53e3e',
                  background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </header>

      {/* MAIN */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'var(--sand-deep)', borderTop: '1px solid var(--sand-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 40,
            paddingBottom: 28,
            borderBottom: '1px solid var(--sand-border)',
            marginBottom: 20,
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--rust)', marginBottom: 8 }}>
                ⌂ StayHaven
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
                Find your perfect stay, anywhere in the world.
              </p>
            </div>

            {footerCols.map(col => (
              <div key={col.title}>
                <h4 style={{
                  fontSize: 12, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--ink)', marginBottom: 12,
                }}>
                  {col.title}
                </h4>
                {col.links.map(l => (
                  <Link
                    key={l.label}
                    to={l.to}
                    style={{ display: 'block', fontSize: 14, color: 'var(--ink-muted)', padding: '3px 0', textDecoration: 'none' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--ink-muted)' }}>
            <span>© 2025 StayHaven, Inc. · Privacy · Terms</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Globe size={13} />
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .sh-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function LogoutButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', fontSize: 14, color: '#e53e3e',
        background: hovered ? 'rgba(229,62,62,0.08)' : 'transparent',
        border: 'none', cursor: 'pointer',
        width: '100%', textAlign: 'left',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <LogOut size={14} /> Sign out
    </button>
  );
}
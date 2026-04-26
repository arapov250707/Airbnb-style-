import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../context/Appcontext';
import { LayoutDashboard, Home, Users, Building2, CalendarCheck, Moon, Sun, LogOut, ArrowLeft } from 'lucide-react';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/properties', icon: Building2, label: 'Properties' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>⌂ StayHaven</Link>
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <img src={user?.avatar} alt={user?.name} className={styles.userAvatar} />
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
          <div className={styles.sidebarActions}>
            <button className={`btn btn-ghost btn-sm`} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link to="/" className={`btn btn-ghost btn-sm`}><ArrowLeft size={15} /> Site</Link>
            <button className={`btn btn-ghost btn-sm`} onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

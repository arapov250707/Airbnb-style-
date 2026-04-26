import { useEffect, useState } from 'react';
import { propertyService, bookingService, userService } from '../../services/api';
import { Building2, Users, CalendarCheck, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './AdminPages.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#c4622d','#c9a84c','#5a7a5e','#3b82f6'];

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      propertyService.getAll({ limit: 100 }),
      bookingService.getAll(),
      userService.getAll(),
    ]).then(([props, bookings, users]) => {
      const revenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalPrice, 0);

      const monthlyRevenue = MONTHS.map((m, i) => ({
        month: m,
        revenue: bookings.filter(b => {
          const mo = new Date(b.checkIn).getMonth();
          return mo === i && b.status !== 'cancelled';
        }).reduce((s, b) => s + b.totalPrice, 0),
        bookings: bookings.filter(b => new Date(b.checkIn).getMonth() === i).length,
      }));

      const typeData = ['apartment','house','villa','cabin','unique'].map(t => ({
        name: t.charAt(0).toUpperCase() + t.slice(1),
        value: props.items.filter(p => p.type === t).length,
      })).filter(d => d.value > 0);

      const statusData = [
        { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
        { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
        { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
      ];

      setData({ properties: props.items.length, bookings: bookings.length, users: users.length, revenue, monthlyRevenue, typeData, statusData });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const kpis = [
    { label: 'Total Properties', value: data.properties, icon: Building2, color: '#c4622d' },
    { label: 'Total Bookings', value: data.bookings, icon: CalendarCheck, color: '#5a7a5e' },
    { label: 'Total Users', value: data.users, icon: Users, color: '#3b82f6' },
    { label: 'Total Revenue', value: `$${data.revenue.toLocaleString()}`, icon: DollarSign, color: '#c9a84c' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Admin Overview</h1>
        <p className={styles.pageSubtitle}>Platform statistics and analytics</p>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: `${k.color}18`, color: k.color }}>
              <k.icon size={20} />
            </div>
            <div>
              <div className={styles.kpiValue}>{k.value}</div>
              <div className={styles.kpiLabel}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}><TrendingUp size={16} /> Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c4622d" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#c4622d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--sand-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v}`, 'Revenue']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#c4622d" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--sand-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--ink-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="bookings" fill="#5a7a5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Property Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {data.typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {data.typeData.map((d, i) => (
              <span key={d.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Booking Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.statusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {data.statusData.map((_, i) => <Cell key={i} fill={['#5a7a5e','#c9a84c','#3b82f6','#dc2626'][i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {data.statusData.filter(d => d.value > 0).map((d, i) => (
              <span key={d.name} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: ['#5a7a5e','#c9a84c','#3b82f6','#dc2626'][i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, MapPin, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { propertyService } from '../services/api';
import CitySearchInput from '../components/common/CitySearchInput';

const TYPES = ['all', 'apartment', 'house', 'villa', 'cabin', 'unique'];
const SORTS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState({ items: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [guests, setGuests] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    propertyService
      .getAll({ search, type, sort, minPrice, maxPrice, guests, page, limit: 6 })
      .then(data => { setResult(data); setLoading(false); });
  }, [search, type, sort, minPrice, maxPrice, guests, page]);

  const doSearch = () => { setSearch(inputVal); setPage(1); };
  const handleKey = (e) => { if (e.key === 'Enter') doSearch(); };

  const resetFilters = () => {
    setInputVal(''); setSearch(''); setType('all'); setSort('');
    setMinPrice(''); setMaxPrice(''); setGuests(''); setPage(1);
  };

  const hasFilters = search || type !== 'all' || sort || minPrice || maxPrice || guests;

  return (
    <div style={{ background: 'var(--sand)', minHeight: 'calc(100vh - 72px)' }}>

      {/* ── BIG SEARCH HERO ── */}
      <div style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--card-border)',
        padding: '28px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)',
            fontWeight: 400, color: 'var(--ink)', marginBottom: 20,
          }}>
            Explore Properties
          </h1>

          {/* Main search bar - big Airbnb style */}
          <div style={{
            display: 'flex', alignItems: 'stretch',
            background: 'var(--card)',
            border: '2px solid var(--card-border)',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            overflow: 'visible',
            marginBottom: 16,
          }}>
            {/* City input */}
            <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                display: 'flex', alignItems: 'center', paddingLeft: 20,
                borderRight: '1px solid var(--card-border)',
                pointerEvents: 'none', zIndex: 1,
              }}>
                <MapPin size={18} style={{ color: 'var(--rust)' }} />
              </div>
              <CitySearchInput
                value={inputVal}
                onChange={setInputVal}
                onSelect={(city) => {
                  const val = city.city || city.label;
                  setInputVal(val);
                  setSearch(val);
                  setPage(1);
                }}
                placeholder="Where are you going?"
              />
            </div>

            {/* Sort select */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1px solid var(--card-border)', flexShrink: 0 }}>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                style={{
                  border: 'none', background: 'transparent',
                  fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
                  outline: 'none', cursor: 'pointer', minWidth: 160,
                  padding: '0 8px',
                }}
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Search button */}
            <button
              onClick={doSearch}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 28px', background: 'var(--rust)', color: '#fff',
                border: 'none', cursor: 'pointer', borderRadius: '0 14px 14px 0',
                fontSize: 15, fontWeight: 600, flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--rust-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--rust)'}
            >
              <Search size={18} /> Search
            </button>
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Type chips */}
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setPage(1); }}
                style={{
                  padding: '6px 16px', borderRadius: 24, fontSize: 13, fontWeight: 500,
                  border: '1.5px solid',
                  borderColor: type === t ? 'var(--rust)' : 'var(--card-border)',
                  background: type === t ? 'var(--rust)' : 'var(--card)',
                  color: type === t ? '#fff' : 'var(--ink-soft)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 24, fontSize: 13, border: '1.5px solid var(--card-border)', background: 'transparent', color: 'var(--ink-muted)', cursor: 'pointer' }}
                >
                  <X size={13} /> Clear
                </button>
              )}
              <button
                onClick={() => setShowFilters(f => !f)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px', borderRadius: 24, fontSize: 13, fontWeight: 500,
                  border: `1.5px solid ${showFilters ? 'var(--rust)' : 'var(--card-border)'}`,
                  background: showFilters ? 'rgba(196,98,45,0.08)' : 'transparent',
                  color: showFilters ? 'var(--rust)' : 'var(--ink-soft)',
                  cursor: 'pointer',
                }}
              >
                <SlidersHorizontal size={14} /> More Filters
              </button>
            </div>
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div style={{
              display: 'flex', gap: 16, flexWrap: 'wrap',
              marginTop: 16, paddingTop: 16,
              borderTop: '1px solid var(--card-border)',
              alignItems: 'flex-end',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>Min Price / night</label>
                <input
                  type="number" min="0" value={minPrice} placeholder="$0"
                  onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink)', fontSize: 14, width: 130, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>Max Price / night</label>
                <input
                  type="number" min="0" value={maxPrice} placeholder="$999"
                  onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink)', fontSize: 14, width: 130, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>Min Guests</label>
                <input
                  type="number" min="1" value={guests} placeholder="Any"
                  onChange={e => { setGuests(e.target.value); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink)', fontSize: 14, width: 110, outline: 'none' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>
          {loading ? 'Searching…' : `${result.total} properties found`}
          {search && <span> for <strong style={{ color: 'var(--ink)' }}>"{search}"</strong></span>}
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : result.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.25, display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--ink-soft)', marginBottom: 8 }}>No properties found</h3>
            <p style={{ color: 'var(--ink-muted)', marginBottom: 20 }}>Try a different city or adjust your filters</p>
            <button onClick={resetFilters} style={{ padding: '10px 24px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink)', cursor: 'pointer', fontSize: 14 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }} className="props-grid">
              {result.items.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>

            {result.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: page === 1 ? 'var(--ink-muted)' : 'var(--ink)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                {Array.from({ length: result.pages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid var(--card-border)', background: n === page ? 'var(--rust)' : 'var(--card)', color: n === page ? '#fff' : 'var(--ink-soft)', cursor: 'pointer', fontSize: 14, fontWeight: n === page ? 600 : 400 }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  disabled={page === result.pages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: page === result.pages ? 'var(--ink-muted)' : 'var(--ink)', cursor: page === result.pages ? 'not-allowed' : 'pointer', fontSize: 14, opacity: page === result.pages ? 0.5 : 1 }}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .props-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .props-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

export function PropertyCard({ property: p }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={`/properties/${p.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        background: 'var(--card)', border: '1px solid var(--card-border)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
          <img
            src={p.images[0]} alt={p.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease' }}
            loading="lazy"
          />
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(26,23,20,0.65)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: 11, fontWeight: 500,
            textTransform: 'capitalize', padding: '3px 10px', borderRadius: 20,
          }}>
            {p.type}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} /> {p.location}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              ★ {p.rating} <span style={{ color: 'var(--ink-muted)' }}>({p.reviewCount})</span>
            </span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {p.title}
          </h3>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 10, display: 'flex', gap: 4 }}>
            <span>{p.bedrooms} bed</span><span>·</span>
            <span>{p.bathrooms} bath</span><span>·</span>
            <span>{p.guests} guests</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--ink)' }}>
              <strong style={{ fontSize: 16, color: 'var(--rust)' }}>${p.price}</strong> / night
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>by {p.hostName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
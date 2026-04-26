import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Mountain, Building2, TreePine, Home, Waves, Loader, Star, Key, X, CheckCircle } from 'lucide-react';
import { propertyService, getApiKey, setApiKey } from '../services/api';
import { useCitySearch } from '../hooks/useCitySearch';
import { useNotification } from '../context/AppContext';

const CATEGORIES = [
  { id: 'all',       label: 'All Stays',   icon: Home      },
  { id: 'apartment', label: 'Apartments',  icon: Building2 },
  { id: 'house',     label: 'Houses',      icon: Home      },
  { id: 'villa',     label: 'Villas',      icon: Waves     },
  { id: 'cabin',     label: 'Cabins',      icon: Mountain  },
  { id: 'unique',    label: 'Unique',      icon: TreePine  },
];

// ── INLINE CITY SEARCH (no import issues) ─────────────────
function HeroSearch({ onSearch }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const { suggestions, loading } = useCitySearch(focused ? value : '');
  const wrapRef = useRef(null);
  const selectingRef = useRef(false);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setFocused(false); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (focused && suggestions.length > 0) setOpen(true);
  }, [suggestions, focused]);

  const submit = () => { if (value.trim()) onSearch(value.trim()); };

  const handleKey = (e) => { if (e.key === 'Enter') { setOpen(false); submit(); } };

  const selectCity = (city) => {
    selectingRef.current = false;
    const v = city.city || city.label;
    setValue(v);
    setOpen(false);
    setFocused(false);
    onSearch(v);
  };

  return (
    <div ref={wrapRef} style={{ display: 'flex', background: '#fff', borderRadius: 60, boxShadow: '0 4px 30px rgba(0,0,0,0.25)', overflow: 'visible', maxWidth: 600, width: '100%', position: 'relative' }}>
      {/* Input */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 6px 0 24px', gap: 10, position: 'relative' }}>
        <MapPin size={18} style={{ color: '#c4622d', flexShrink: 0 }} />
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { if (!selectingRef.current) { setOpen(false); setFocused(false); } }, 200)}
          onKeyDown={handleKey}
          placeholder="Where are you going?"
          autoComplete="off"
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: 15, fontFamily: 'var(--font-body)',
            background: 'transparent', color: '#1a1714',
            padding: '18px 0',
          }}
        />
        {loading && <Loader size={15} style={{ color: '#c4622d', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />}
        {value && !loading && (
          <button onClick={() => { setValue(''); setOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#999', display: 'flex', flexShrink: 0 }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={submit}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 28px', background: '#c4622d', color: '#fff',
          border: 'none', borderRadius: 60, cursor: 'pointer',
          fontSize: 15, fontWeight: 600, margin: 5,
          transition: 'background 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#a04e22'}
        onMouseLeave={e => e.currentTarget.style.background = '#c4622d'}
      >
        <Search size={17} /> Search
      </button>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: '1px solid #e8e0d0',
          zIndex: 9999, overflow: 'hidden',
        }}>
          {suggestions.map((city, i) => (
            <SuggestionItem key={i} city={city}
              onMouseDown={() => { selectingRef.current = true; }}
              onMouseUp={() => selectCity(city)}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SuggestionItem({ city, onMouseDown, onMouseUp }) {
  const [hov, setHov] = useState(false);
  const parts = city.label.split(', ');
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onMouseDown={onMouseDown} onMouseUp={onMouseUp}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: hov ? '#f5f0e8' : 'transparent', cursor: 'pointer' }}
    >
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(196,98,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <MapPin size={15} style={{ color: '#c4622d' }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1714' }}>{parts[0]}</div>
        {parts.length > 1 && <div style={{ fontSize: 12, color: '#7a7168' }}>{parts.slice(1).join(', ')}</div>}
      </div>
    </div>
  );
}

// ── API KEY SETUP BANNER ──────────────────────────────────
function ApiKeyBanner({ onSaved }) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(!!getApiKey());

  const save = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      setSaved(true);
      setShow(false);
      onSaved && onSaved();
    }
  };

  if (saved) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(90,122,94,0.12)', border: '1px solid rgba(90,122,94,0.3)', borderRadius: 12, padding: '10px 16px', marginBottom: 24, fontSize: 13 }}>
      <CheckCircle size={15} style={{ color: '#5a7a5e', flexShrink: 0 }} />
      <span style={{ color: 'var(--ink-soft)' }}>Real hotel API connected — search any city to load live results</span>
      <button onClick={() => { localStorage.removeItem('sh_rapidapi_key'); setSaved(false); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 12 }}>Change key</button>
    </div>
  );

  return (
    <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Key size={15} style={{ color: '#c9a84c', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Connect Real Hotel API</span>
        <button onClick={() => setShow(s => !s)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rust)', fontSize: 13, fontWeight: 600 }}>
          {show ? 'Hide' : 'Setup →'}
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: 0 }}>
        Add your RapidAPI key to load real hotels from Booking.com
      </p>
      {show && (
        <div style={{ marginTop: 14 }}>
          <ol style={{ fontSize: 13, color: 'var(--ink-soft)', paddingLeft: 18, lineHeight: 2, marginBottom: 12 }}>
            <li>Go to <a href="https://rapidapi.com/DataCrawler/api/booking-com15" target="_blank" rel="noreferrer" style={{ color: 'var(--rust)', fontWeight: 600 }}>rapidapi.com → Booking.com15</a></li>
            <li>Click <strong>Subscribe to Test</strong> → choose <strong>FREE</strong> plan (500 req/month)</li>
            <li>Copy your <strong>X-RapidAPI-Key</strong> from the header</li>
            <li>Paste below and click Save</li>
          </ol>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={key} onChange={e => setKey(e.target.value)}
              placeholder="Paste your RapidAPI key here…"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink)', fontSize: 14, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && save()}
            />
            <button onClick={save} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--rust)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROPERTY CARD ─────────────────────────────────────────
function PropCard({ p }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={`/properties/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--card-border)', transform: hov ? 'translateY(-4px)' : 'none', boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.12)' : 'var(--shadow-sm)', transition: 'all 0.2s' }}>
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
          <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s' }} loading="lazy" />
          <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(26,23,20,0.65)', color: '#fff', fontSize: 11, fontWeight: 500, textTransform: 'capitalize', padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>{p.type}</div>
          {p.source === 'booking' && <div style={{ position: 'absolute', top: 10, right: 10, background: '#003580', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>LIVE</div>}
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{p.location}</span>
            <span style={{ fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 2 }}><Star size={11} style={{ fill: 'var(--gold)' }} />{p.rating}</span>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.title}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong style={{ fontSize: 16, color: 'var(--rust)' }}>${p.price}</strong><span style={{ fontSize: 12, color: 'var(--ink-muted)' }}> / night</span></span>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{p.guests} guests</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResults, setApiResults] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiCity, setApiCity] = useState('');
  const navigate = useNavigate();
  const { add } = useNotification();

  useEffect(() => {
    propertyService.getFeatured().then(setFeatured).finally(() => setLoading(false));
  }, []);

  const handleSearch = async (cityName) => {
    const hasKey = !!getApiKey();
    if (hasKey) {
      // Try real API first
      setApiLoading(true);
      setApiCity(cityName);
      try {
        const results = await propertyService.searchReal(cityName);
        if (results.length > 0) {
          propertyService.cacheProperties(results);
          setApiResults(results);
          add(`Found ${results.length} real hotels in ${cityName} 🏨`, 'success');
          setApiLoading(false);
          return;
        }
      } catch (err) {
        if (err.message === 'INVALID_KEY') {
          add('Invalid API key. Using local data.', 'error');
          localStorage.removeItem('sh_rapidapi_key');
        } else if (err.message !== 'NO_KEY') {
          add('API unavailable, showing local results', 'info');
        }
      }
      setApiLoading(false);
    }
    // Fallback: go to properties page with search
    navigate(`/properties?search=${encodeURIComponent(cityName)}`);
  };

  const displayProperties = apiResults || featured;

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: 580,
        display: 'flex', alignItems: 'center',
        background: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600) center/cover no-repeat',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(26,23,20,0.72) 0%,rgba(26,23,20,0.4) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 16 }}>
            Discover · Stay · Explore
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,5vw,3.8rem)', fontWeight: 300, color: '#fff', marginBottom: 16, lineHeight: 1.15 }}>
            Find your perfect<br /><em style={{ fontStyle: 'italic', color: '#c9a84c' }}>home away from home</em>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', marginBottom: 36 }}>
            Over 8,000 handpicked properties across the globe
          </p>

          {/* THE SEARCH BAR */}
          <div style={{ marginBottom: 40 }}>
            <HeroSearch onSearch={handleSearch} />
          </div>

          {apiLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
              Searching real hotels in {apiCity}…
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['8,000+','Properties'],['150+','Destinations'],['50K+','Happy guests']].map(([v, l], i) => (
              <>
                {i > 0 && <div key={`d${i}`} style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.25)' }} />}
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: '#fff' }}>{v}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{l}</div>
                </div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ padding: '28px 0', borderBottom: '1px solid var(--sand-border)', background: 'var(--card)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <Link key={id} to={`/properties?type=${id}`} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 22px', borderRadius: 14, minWidth: 95, flexShrink: 0,
                background: 'var(--card)', border: '1.5px solid var(--card-border)',
                color: 'var(--ink-soft)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rust)'; e.currentTarget.style.color = 'var(--rust)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.color = 'var(--ink-soft)'; e.currentTarget.style.transform = 'none'; }}>
                <Icon size={22} style={{ color: 'var(--rust)' }} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── API KEY SETUP + RESULTS ── */}
      <section style={{ padding: '48px 0', background: 'var(--sand)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <ApiKeyBanner onSaved={() => add('API key saved! Now search a city to load real hotels.', 'success')} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
                {apiResults ? `Hotels in ${apiCity}` : 'Featured Stays'}
              </h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 15 }}>
                {apiResults ? `${apiResults.length} live results from Booking.com` : 'Handpicked properties our guests love most'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {apiResults && (
                <button onClick={() => setApiResults(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 13 }}>
                  ← Show featured
                </button>
              )}
              <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1.5px solid var(--card-border)', background: 'var(--card)', color: 'var(--ink-soft)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                View all <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {loading || apiLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} className="home-grid">
              {displayProperties.slice(0, 8).map(p => <PropCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '60px 0', background: 'var(--sand-deep)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 20, padding: 48 }}>
            <div style={{ maxWidth: 480 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, marginBottom: 12, color: 'var(--ink)' }}>Become a host</h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
                Turn your spare space into extra income. List your property for free and reach thousands of travelers.
              </p>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'var(--rust)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>
                Start hosting →
              </Link>
            </div>
            <div style={{ flexShrink: 0, background: 'var(--ink)', borderRadius: 16, padding: 32, textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: '2.5rem', color: 'var(--rust-light)', marginBottom: 8 }}>⌂</div>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(245,240,232,0.5)', marginBottom: 4 }}>Avg. earning</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#c9a84c' }}>$2,400<span style={{ fontSize: '1rem', color: 'rgba(245,240,232,0.4)' }}>/mo</span></div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) { .home-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .home-grid { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
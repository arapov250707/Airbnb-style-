import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useCitySearch } from '../../hooks/useCitySearch';

export default function CitySearchInput({ value, onChange, onSelect, placeholder = 'Where are you going?' }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const { suggestions, loading } = useCitySearch(focused ? value : '');
  const wrapRef = useRef(null);
  // Flag: user clicked on a suggestion — prevent blur from closing before select fires
  const selectingRef = useRef(false);

  useEffect(() => {
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (focused && suggestions.length > 0) setOpen(true);
    else if (!selectingRef.current) setOpen(false);
  }, [suggestions, focused]);

  const handleSelect = (city) => {
    selectingRef.current = false;
    const val = city.city || city.label;
    onChange(val);
    if (onSelect) onSelect(city);
    setOpen(false);
    setFocused(false);
  };

  const handleBlur = () => {
    // Delay close so mousedown on option fires first
    setTimeout(() => {
      if (!selectingRef.current) {
        setOpen(false);
        setFocused(false);
      }
    }, 200);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); if (suggestions.length > 0) setOpen(true); }}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '16px 44px 16px 52px',
          border: 'none',
          background: 'transparent',
          color: 'var(--ink)',
          fontSize: 15,
          outline: 'none',
          fontFamily: 'var(--font-body)',
          boxSizing: 'border-box',
        }}
      />

      {loading && (
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--ink-muted)', display: 'flex', alignItems: 'center',
        }}>
          <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
        </span>
      )}

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: -2, right: -2,
          background: 'var(--card)',
          border: '1.5px solid var(--rust)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {suggestions.map((city, i) => (
            <CityOption
              key={i}
              city={city}
              onSelectStart={() => { selectingRef.current = true; }}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CityOption({ city, onSelect, onSelectStart }) {
  const [hovered, setHovered] = useState(false);
  const parts = city.label.split(', ');
  const main = parts[0];
  const sub = parts.slice(1).join(', ');

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // onMouseDown fires BEFORE input's onBlur — set flag so blur doesn't close early
      onMouseDown={() => onSelectStart()}
      // onMouseUp fires after blur — safe to select
      onMouseUp={() => onSelect(city)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '12px 16px',
        background: hovered ? 'var(--sand-deep)' : 'transparent',
        cursor: 'pointer', userSelect: 'none',
        transition: 'background 0.1s',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: hovered ? 'rgba(196,98,45,0.18)' : 'rgba(196,98,45,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.1s',
      }}>
        <MapPin size={15} style={{ color: 'var(--rust)' }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{main}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}
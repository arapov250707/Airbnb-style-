import { useState, useEffect, useRef } from 'react';

// Uses OpenStreetMap Nominatim — free, no API key needed
export function useCitySearch(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef({});

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const key = query.toLowerCase();
    if (cache.current[key]) {
      setSuggestions(cache.current[key]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&featuretype=city`;
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'StayHaven/1.0' },
        });
        const data = await res.json();

        const cities = data
          .filter(p => ['city', 'town', 'village', 'administrative'].includes(p.type) || p.class === 'place' || p.class === 'boundary')
          .map(p => {
            const addr = p.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality || p.name;
            const country = addr.country || '';
            const state = addr.state || '';
            const label = [city, state, country].filter(Boolean).join(', ');
            return { label, city, country, lat: parseFloat(p.lat), lng: parseFloat(p.lon) };
          })
          .filter((v, i, arr) => arr.findIndex(x => x.label === v.label) === i)
          .slice(0, 6);

        cache.current[key] = cities;
        setSuggestions(cities);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
}
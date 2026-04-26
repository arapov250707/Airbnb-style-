// ============================================================
//  StayHaven — API Service
//  Real Kyrgyzstan properties + Booking.com RapidAPI integration
// ============================================================

const PROPERTIES_KEY = 'sh_properties';
const USERS_KEY      = 'sh_users';
const BOOKINGS_KEY   = 'sh_bookings';
const AUTH_KEY       = 'sh_auth';
const API_KEY_STORE  = 'sh_rapidapi_key';

export const getApiKey   = ()    => localStorage.getItem(API_KEY_STORE) || '';
export const setApiKey   = (key) => localStorage.setItem(API_KEY_STORE, key);
export const clearApiKey = ()    => localStorage.removeItem(API_KEY_STORE);

function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms));
}

// ── BOOKING.COM via RapidAPI ──────────────────────────────
const RAPID_HOST = 'booking-com15.p.rapidapi.com';

async function rapidFetch(path, params = {}) {
  const key = getApiKey();
  if (!key) throw new Error('NO_KEY');
  const url = new URL(`https://${RAPID_HOST}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': RAPID_HOST },
  });
  if (res.status === 401 || res.status === 403) throw new Error('INVALID_KEY');
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function hotelToProperty(h) {
  const images = [];
  if (h.main_photo_url) images.push(h.main_photo_url.replace('square60', 'max1024x768'));
  if (images.length === 0) images.push('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800');

  const price = h.price_breakdown?.all_inclusive_price
    ? Math.round(h.price_breakdown.all_inclusive_price)
    : Math.round(30 + Math.random() * 120);

  return {
    id: 'bk_' + String(h.hotel_id || Date.now()),
    title: h.hotel_name || 'Hotel',
    location: [h.city, h.country_trans].filter(Boolean).join(', '),
    price,
    type: 'apartment',
    guests: 2, bedrooms: 1, bathrooms: 1,
    rating: h.review_score ? parseFloat((h.review_score / 2).toFixed(1)) : 4.0,
    reviewCount: h.review_nr || 0,
    images,
    amenities: ['WiFi', 'Kitchen'],
    description: `${h.hotel_name} — located in ${h.city || 'Kyrgyzstan'}.`,
    hostId: 'external', hostName: h.hotel_name || 'Host',
    hosted: '2020', status: 'active', featured: false,
    lat: parseFloat(h.latitude || 42.87),
    lng: parseFloat(h.longitude || 74.59),
    source: 'booking',
  };
}

export const propertyService = {
  searchReal: async (cityName) => {
    const destData = await rapidFetch('/api/v1/hotels/searchDestination', { query: cityName });
    const dest = destData?.data?.[0];
    if (!dest) throw new Error('City not found');
    const ci = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const co = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const data = await rapidFetch('/api/v1/hotels/searchHotels', {
      dest_id: dest.dest_id, search_type: dest.dest_type || 'city',
      arrival_date: ci, departure_date: co,
      adults: '2', room_qty: '1', page_number: '1',
      languagecode: 'en-us', currency_code: 'USD',
    });
    return (data?.data?.hotels || []).map(hotelToProperty);
  },

  cacheProperties: (props) => {
    const existing = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    const ids = new Set(existing.map(p => p.id));
    const merged = [...existing, ...props.filter(p => !ids.has(p.id))];
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(merged));
    return merged;
  },

  getAll: async (filters = {}) => {
    await delay(200);
    let props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    if (filters.search) {
      const q = filters.search.toLowerCase();
      props = props.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    if (filters.type && filters.type !== 'all') props = props.filter(p => p.type === filters.type);
    if (filters.minPrice) props = props.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) props = props.filter(p => p.price <= Number(filters.maxPrice));
    if (filters.guests)   props = props.filter(p => p.guests >= Number(filters.guests));
    if (filters.sort === 'price_asc')  props.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price_desc') props.sort((a, b) => b.price - a.price);
    if (filters.sort === 'rating')     props.sort((a, b) => b.rating - a.rating);
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 6;
    const total = props.length;
    return { items: props.slice((page - 1) * limit, page * limit), total, page, limit, pages: Math.ceil(total / limit) };
  },

  getById: async (id) => {
    await delay(150);
    const props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    const p = props.find(p => p.id === id);
    if (!p) throw new Error('Property not found');
    return p;
  },

  create: async (data) => {
    await delay(300);
    const props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    const np = { ...data, id: 'p_' + Date.now(), rating: 0, reviewCount: 0, status: 'active' };
    props.push(np);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(props));
    return np;
  },

  update: async (id, data) => {
    await delay(300);
    const props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    const idx = props.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Property not found');
    props[idx] = { ...props[idx], ...data };
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(props));
    return props[idx];
  },

  delete: async (id) => {
    await delay(200);
    let props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(props.filter(p => p.id !== id)));
  },

  getFeatured: async () => {
    await delay(150);
    const props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
    return props.filter(p => p.featured).slice(0, 8);
  },
};

// ── AUTH ──────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    await delay(400);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safe } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(safe));
    return safe;
  },
  register: async ({ name, email, password }) => {
    await delay(400);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find(u => u.email === email)) throw new Error('Email already in use');
    const nu = { id: 'u_' + Date.now(), name, email, password, role: 'guest', avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`, joined: new Date().toISOString().split('T')[0], phone: '', bio: '' };
    users.push(nu);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...safe } = nu;
    localStorage.setItem(AUTH_KEY, JSON.stringify(safe));
    return safe;
  },
  logout: () => localStorage.removeItem(AUTH_KEY),
  getSession: () => { const r = localStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null; },
  updateProfile: async (userId, data) => {
    await delay(300);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...data };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...safe } = users[idx];
    localStorage.setItem(AUTH_KEY, JSON.stringify(safe));
    return safe;
  },
};

export const bookingService = {
  getAll: async () => { await delay(200); return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); },
  getByUser: async (userId) => { await delay(150); return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]').filter(b => b.userId === userId); },
  create: async (data) => {
    await delay(350);
    const bs = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const nb = { ...data, id: 'b_' + Date.now(), status: 'pending', createdAt: new Date().toISOString().split('T')[0] };
    bs.push(nb);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bs));
    return nb;
  },
  updateStatus: async (id, status) => {
    await delay(200);
    const bs = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const idx = bs.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Not found');
    bs[idx] = { ...bs[idx], status };
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bs));
    return bs[idx];
  },
  delete: async (id) => {
    await delay(200);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]').filter(b => b.id !== id)));
  },
};

export const userService = {
  getAll: async () => { await delay(200); return JSON.parse(localStorage.getItem(USERS_KEY) || '[]').map(({ password: _, ...u }) => u); },
  delete: async (id) => { await delay(200); localStorage.setItem(USERS_KEY, JSON.stringify(JSON.parse(localStorage.getItem(USERS_KEY) || '[]').filter(u => u.id !== id))); },
  updateRole: async (id, role) => {
    await delay(200);
    const us = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = us.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Not found');
    us[idx].role = role;
    localStorage.setItem(USERS_KEY, JSON.stringify(us));
    return us[idx];
  },
};

// ── KYRGYZSTAN REAL PROPERTIES DATA ──────────────────────
const KG_PROPERTIES = [
  // ── БИШКЕК ──
  {
    id: 'kg1',
    title: 'Апартаменты в центре Бишкека',
    location: 'Бишкек, Кыргызстан',
    price: 35,
    type: 'apartment',
    guests: 3, bedrooms: 2, bathrooms: 1,
    rating: 4.85, reviewCount: 112,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    amenities: ['WiFi', 'Кухня', 'Кондиционер', 'Стиральная машина', 'Парковка'],
    description: 'Уютные апартаменты в самом центре Бишкека, в 5 минутах от площади Ала-Тоо. Полностью оборудованная кухня, скоростной WiFi. Идеально для деловых поездок и туристов.',
    hostId: 'user1', hostName: 'Айгуль Маматова', hosted: '2021',
    lat: 42.8746, lng: 74.5698, status: 'active', featured: true,
  },
  {
    id: 'kg2',
    title: 'Современная студия на Манасе',
    location: 'Бишкек, Кыргызстан',
    price: 22,
    type: 'apartment',
    guests: 2, bedrooms: 1, bathrooms: 1,
    rating: 4.72, reviewCount: 87,
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    ],
    amenities: ['WiFi', 'Кухня', 'Кондиционер', 'Смарт-ТВ'],
    description: 'Стильная студия на проспекте Манаса. Рядом ТЦ «Вефа», рестораны и кафе. Отличный вид на горы Тянь-Шань.',
    hostId: 'user2', hostName: 'Бакыт Осмонов', hosted: '2022',
    lat: 42.8701, lng: 74.5894, status: 'active', featured: false,
  },
  {
    id: 'kg3',
    title: 'Гостевой дом «Ала-Тоо» Бишкек',
    location: 'Бишкек, Кыргызстан',
    price: 28,
    type: 'house',
    guests: 6, bedrooms: 3, bathrooms: 2,
    rating: 4.91, reviewCount: 203,
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    ],
    amenities: ['WiFi', 'Кухня', 'Сад', 'Парковка', 'Мангал', 'Завтрак'],
    description: 'Традиционный кыргызский гостевой дом в тихом районе Бишкека. Большой сад, домашняя атмосфера. Хозяева помогут организовать туры по Кыргызстану.',
    hostId: 'admin', hostName: 'Нургуль Токтогулова', hosted: '2019',
    lat: 42.8833, lng: 74.5500, status: 'active', featured: true,
  },

  // ── ИССЫК-КУЛЬ ──
  {
    id: 'kg4',
    title: 'Вилла на берегу Иссык-Куля',
    location: 'Чолпон-Ата, Иссык-Куль',
    price: 85,
    type: 'villa',
    guests: 8, bedrooms: 4, bathrooms: 2,
    rating: 4.96, reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
    ],
    amenities: ['WiFi', 'Пляж', 'Бассейн', 'Кухня', 'Мангал', 'Парковка', 'Горные виды'],
    description: 'Шикарная вилла в 50 метрах от берега Иссык-Куля. Собственный выход на пляж, большая терраса с видом на озеро и горы. Идеально для семейного отдыха летом.',
    hostId: 'user2', hostName: 'Карим Эрматов', hosted: '2020',
    lat: 42.6500, lng: 77.0833, status: 'active', featured: true,
  },
  {
    id: 'kg5',
    title: 'Коттедж у озера Иссык-Куль',
    location: 'Бостери, Иссык-Куль',
    price: 55,
    type: 'house',
    guests: 6, bedrooms: 3, bathrooms: 1,
    rating: 4.78, reviewCount: 145,
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ],
    amenities: ['WiFi', 'Озеро рядом', 'Кухня', 'Мангал', 'Терраса', 'Горы'],
    description: 'Уютный коттедж в посёлке Бостери. Тихое место, чистый воздух. До берега Иссык-Куля — 200 метров. Отличное место для отдыха от городской суеты.',
    hostId: 'user1', hostName: 'Гульнара Асанова', hosted: '2021',
    lat: 42.6700, lng: 77.1500, status: 'active', featured: false,
  },
  {
    id: 'kg6',
    title: 'Юрточный лагерь Иссык-Куль',
    location: 'Кочкор, Иссык-Куль',
    price: 40,
    type: 'unique',
    guests: 4, bedrooms: 2, bathrooms: 1,
    rating: 4.98, reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    amenities: ['Завтрак включён', 'Конные прогулки', 'Национальная кухня', 'Горные виды', 'Экскурсии'],
    description: 'Аутентичные кыргызские юрты в предгорьях Тянь-Шаня. Национальная кухня, конные прогулки, трекинг. Незабываемое знакомство с кочевой культурой кыргызов.',
    hostId: 'admin', hostName: 'Мирбек Джумалиев', hosted: '2018',
    lat: 42.2167, lng: 75.7667, status: 'active', featured: true,
  },

  // ── КАРАКОЛ ──
  {
    id: 'kg7',
    title: 'Гостевой дом «Тянь-Шань» Каракол',
    location: 'Каракол, Кыргызстан',
    price: 30,
    type: 'house',
    guests: 5, bedrooms: 2, bathrooms: 1,
    rating: 4.88, reviewCount: 91,
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    amenities: ['WiFi', 'Кухня', 'Завтрак', 'Трансфер', 'Прокат велосипедов', 'Горные туры'],
    description: 'Популярный гостевой дом у подножия Тянь-Шаня. Отправная точка для треккинга в Каракольское ущелье, к Ала-Кулю и Алтын-Арашану. Опытные гиды.',
    hostId: 'user1', hostName: 'Данияр Кулов', hosted: '2020',
    lat: 42.4884, lng: 78.3939, status: 'active', featured: false,
  },
  {
    id: 'kg8',
    title: 'Горная база «Алтын-Арашан»',
    location: 'Каракол, Кыргызстан',
    price: 45,
    type: 'cabin',
    guests: 4, bedrooms: 2, bathrooms: 1,
    rating: 5.0, reviewCount: 27,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
    ],
    amenities: ['Горячие источники', 'Горные виды', 'Кухня', 'Трекинг', 'Живописная природа'],
    description: 'Эко-лодж в горном ущелье Алтын-Арашан на высоте 2500м. Природные горячие источники, нетронутая природа, звёздное небо. Рай для любителей активного отдыха.',
    hostId: 'user2', hostName: 'Чынгыз Алиев', hosted: '2019',
    lat: 42.4200, lng: 78.4500, status: 'active', featured: true,
  },

  // ── ОШ ──
  {
    id: 'kg9',
    title: 'Апартаменты у горы Сулейман-Тоо',
    location: 'Ош, Кыргызстан',
    price: 20,
    type: 'apartment',
    guests: 3, bedrooms: 2, bathrooms: 1,
    rating: 4.70, reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ],
    amenities: ['WiFi', 'Кухня', 'Кондиционер', 'Рядом базар'],
    description: 'Удобные апартаменты в историческом центре Оша, в 10 минутах ходьбы от горы Сулейман-Тоо (ЮНЕСКО) и Ошского базара. Великолепная кыргызская кухня рядом.',
    hostId: 'user1', hostName: 'Зарина Юсупова', hosted: '2022',
    lat: 40.5283, lng: 72.7985, status: 'active', featured: false,
  },
  {
    id: 'kg10',
    title: 'Бутик-отель «Великий Шёлковый Путь»',
    location: 'Ош, Кыргызстан',
    price: 48,
    type: 'apartment',
    guests: 2, bedrooms: 1, bathrooms: 1,
    rating: 4.93, reviewCount: 74,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    amenities: ['WiFi', 'Завтрак включён', 'Кондиционер', 'Экскурсии', 'Трансфер'],
    description: 'Элегантный бутик-отель в духе Шёлкового Пути. Традиционный декор, современный комфорт. Организуем туры в Узген, Кугарт, Баткен.',
    hostId: 'admin', hostName: 'Феруза Исакова', hosted: '2021',
    lat: 40.5247, lng: 72.7938, status: 'active', featured: true,
  },

  // ── НАРЫН ──
  {
    id: 'kg11',
    title: 'Юрта в долине реки Нарын',
    location: 'Нарын, Кыргызстан',
    price: 35,
    type: 'unique',
    guests: 4, bedrooms: 1, bathrooms: 1,
    rating: 4.95, reviewCount: 43,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    ],
    amenities: ['Завтрак включён', 'Национальная кухня', 'Лошади', 'Горные виды', 'Звёздное небо'],
    description: 'Традиционная юрта в чистейшей высокогорной долине. Рядом — Нарынский заповедник, Таш-Рабат (средневековый каравансарай). Настоящий кыргызский кочевой опыт.',
    hostId: 'user2', hostName: 'Уланбек Мамытов', hosted: '2020',
    lat: 41.4289, lng: 75.9903, status: 'active', featured: true,
  },
  {
    id: 'kg12',
    title: 'Горная база у Сонкёля',
    location: 'Сонкёль, Кыргызстан',
    price: 50,
    type: 'cabin',
    guests: 6, bedrooms: 3, bathrooms: 1,
    rating: 4.97, reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    ],
    amenities: ['Нац. кухня', 'Лошади', 'Рыбалка', 'Горные виды', 'Звёздное небо', 'Без электричества'],
    description: 'Деревянная база у высокогорного озера Сон-Кёль (3016м). Нетронутая природа, рыбалка, конные переходы. Летом — пастбища, яки, орлы. Настоящая дикая природа Кыргызстана.',
    hostId: 'user1', hostName: 'Акылбек Осмонов', hosted: '2019',
    lat: 41.8333, lng: 75.1167, status: 'active', featured: true,
  },
];

const SAMPLE_USERS = [
  { id: 'admin', email: 'admin@stayhaven.com', password: 'admin123', name: 'Sarah Mitchell',   role: 'admin', avatar: 'https://i.pravatar.cc/150?img=47', joined: '2019-01-15', phone: '+996 555 000001', bio: 'StayHaven администратор.' },
  { id: 'user1', email: 'emma@example.com',   password: 'user123',  name: 'Айгуль Маматова', role: 'host',  avatar: 'https://i.pravatar.cc/150?img=5',  joined: '2021-03-22', phone: '+996 700 123456', bio: 'Хозяйка апартаментов в Бишкеке.' },
  { id: 'user2', email: 'carlos@example.com', password: 'user123',  name: 'Бакыт Осмонов',   role: 'host',  avatar: 'https://i.pravatar.cc/150?img=12', joined: '2020-07-10', phone: '+996 550 987654', bio: 'Хостел у Иссык-Куля.' },
  { id: 'user3', email: 'guest@example.com',  password: 'user123',  name: 'Alex Johnson',    role: 'guest', avatar: 'https://i.pravatar.cc/150?img=33', joined: '2023-11-01', phone: '+1 555 456789',   bio: 'Путешественник.' },
];

const SAMPLE_BOOKINGS = [
  { id: 'b1', propertyId: 'kg4', userId: 'user3', guestName: 'Alex Johnson', checkIn: '2025-07-10', checkOut: '2025-07-15', guests: 2, totalPrice: 425,  status: 'confirmed',  createdAt: '2025-04-01' },
  { id: 'b2', propertyId: 'kg6', userId: 'user3', guestName: 'Alex Johnson', checkIn: '2025-08-01', checkOut: '2025-08-04', guests: 2, totalPrice: 120,  status: 'pending',    createdAt: '2025-04-10' },
  { id: 'b3', propertyId: 'kg1', userId: 'user1', guestName: 'Айгуль Маматова', checkIn: '2025-05-05', checkOut: '2025-05-08', guests: 2, totalPrice: 105, status: 'completed', createdAt: '2025-03-15' },
];

export function seedData() {
  if (!localStorage.getItem(PROPERTIES_KEY)) localStorage.setItem(PROPERTIES_KEY, JSON.stringify(KG_PROPERTIES));
  if (!localStorage.getItem(USERS_KEY))      localStorage.setItem(USERS_KEY, JSON.stringify(SAMPLE_USERS));
  if (!localStorage.getItem(BOOKINGS_KEY))   localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SAMPLE_BOOKINGS));
}

// Force re-seed if old US data exists
export function reseedKyrgyzstan() {
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(KG_PROPERTIES));
}

seedData();
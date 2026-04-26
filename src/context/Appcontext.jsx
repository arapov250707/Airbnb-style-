import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/api';

// ── AUTH CONTEXT ──────────────────────────────────────────
const AuthContext = createContext(null);

const initialState = { user: null, loading: true, error: null };

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':         return { ...state, user: action.payload, loading: false };
    case 'LOGIN_SUCCESS':return { user: action.payload, loading: false, error: null };
    case 'LOGOUT':       return { user: null, loading: false, error: null };
    case 'ERROR':        return { ...state, loading: false, error: action.payload };
    case 'LOADING':      return { ...state, loading: true, error: null };
    case 'UPDATE_USER':  return { ...state, user: action.payload };
    default:             return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const session = authService.getSession();
    dispatch({ type: 'INIT', payload: session });
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    try {
      const user = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message });
      throw err;
    }
  };

  const register = async (data) => {
    dispatch({ type: 'LOADING' });
    try {
      const user = await authService.register(data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message });
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => dispatch({ type: 'UPDATE_USER', payload: user });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// ── THEME CONTEXT ─────────────────────────────────────────
const ThemeContext = createContext(null);

function applyTheme(theme) {
  // Apply to BOTH html and body to ensure CSS variables are picked up
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.className = theme === 'dark' ? 'dark' : '';
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('sh_theme', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sh_theme') || 'light';
    return saved;
  });

  // Apply on mount
  useEffect(() => {
    applyTheme(theme);
  }, []); // eslint-disable-line

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};

// ── NOTIFICATION CONTEXT ──────────────────────────────────
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(n => [...n, { id, message, type }]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000);
  }, []);

  const remove = useCallback((id) => {
    setNotifications(n => n.filter(x => x.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, add, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
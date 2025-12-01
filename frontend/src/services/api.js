// src/services/api.js
import axios from 'axios';

/**
 * Determina la base del API de forma robusta:
 * - Si VITE_API_BASE está definida la usamos.
 * - Si VITE_API_BASE_URL está definida la usamos (compatibilidad).
 * - Si ninguna está definida usamos '/api' (prefijo relativo al mismo host).
 *
 * Si la variable de entorno apunta al mismo host del frontend pero no incluye '/api',
 * añadimos '/api' al final para evitar peticiones a rutas públicas del frontend.
 */
const envBase =
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || null;

function ensureApiPath(base) {
  if (!base) return '/api';
  try {
    // Si es una URL absoluta, normalizar y añadir /api si falta
    const u = new URL(base, window?.location?.origin);
    // si la ruta ya contiene '/api' en el pathname no tocarla
    if (u.pathname && u.pathname.includes('/api')) {
      // reconstruir origin + pathname (sin duplicar slash)
      return `${u.origin}${u.pathname.replace(/\/+$/, '')}`;
    }
    // añadir '/api' al final del pathname
    const path = (u.pathname || '').replace(/\/+$/, '') + '/api';
    return `${u.origin}${path}`;
  } catch (e) {
    // Si no es una URL absoluta, tratar como path relativo
    const p = String(base).trim();
    if (p === '' || p === '/') return '/api';
    return p.endsWith('/api')
      ? p.replace(/\/+$/, '')
      : p.replace(/\/+$/, '') + '/api';
  }
}

const API_BASE = ensureApiPath(envBase);

// Log temporal para debugging (elimina en producción)
console.log('API base (build):', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      config.headers = config.headers || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.error(
        '[API error]',
        error?.response?.status,
        error?.response?.data ?? error.message
      );
    } catch (e) {}
    return Promise.reject(error);
  }
);

export default api;

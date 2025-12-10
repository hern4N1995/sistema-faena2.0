// src/services/api.js
import axios from 'axios';

/**
 * Determina la base del API en RUNTIME:
 * - Si el hostname es sistema-faena2-0.vercel.app → usa backend remoto (onrender.com)
 * - Si es localhost o 127.0.0.1 → usa /api relativo
 * - Fallback: /api
 */
function getApiBase() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Vercel: siempre usar backend remoto
    if (hostname === 'sistema-faena2-0.vercel.app') {
      console.log('[API] Detectado Vercel, usando backend remoto');
      return 'https://sistema-faena.onrender.com/api';
    }

    // Localhost: usar /api relativo
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[API] Detectado localhost, usando /api');
      return '/api';
    }
  }

  // Fallback
  return '/api';
}

const API_BASE = getApiBase();

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

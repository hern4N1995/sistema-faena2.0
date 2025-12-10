// src/services/api.js
import axios from 'axios';

/**
 * Determina la base del API:
 * - Si estamos en Vercel (sistema-faena2-0.vercel.app), usa backend remoto (onrender.com)
 * - Si estamos en localhost, usa /api (relativo, asume backend en mismo puerto o proxy)
 * - Si hay variable de entorno VITE_API_BASE_URL, úsala
 */
function getApiBase() {
  // Priorizar variable de entorno si existe
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL.trim();
    if (url && url !== '') return url;
  }

  // Si estamos en producción (Vercel), usar backend remoto
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'sistema-faena2-0.vercel.app'
  ) {
    return 'https://sistema-faena.onrender.com/api';
  }

  // Para desarrollo local o cualquier otro caso, usar /api relativo
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

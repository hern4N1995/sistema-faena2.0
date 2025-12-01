/* import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para incluir token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
 */

// src/services/api.js
import axios from 'axios';

/**
 * Base URL para el API:
 * - Primero intenta VITE_API_BASE (recomendado).
 * - Luego VITE_API_BASE_URL (compatibilidad con builds previos).
 * - Fallback seguro a '/api' para entornos donde el backend se sirve bajo ese prefijo.
 */
const API_BASE =
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || '/api';

// Log temporal para verificar en consola qué base se usó en el build.
// Puedes eliminarlo cuando confirmes que todo funciona en producción.
console.log('API base (build):', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Cambiar a true si el backend usa cookies/sesiones y CORS está configurado para permitir credentials
  withCredentials: false,
});

// Añadir token Authorization si existe en localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      config.headers = config.headers || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // noop en entornos donde localStorage no esté disponible
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor centralizado de respuestas para logging y rethrow
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.error(
        '[API error]',
        error?.response?.status,
        error?.response?.data ?? error.message
      );
    } catch (e) {
      // noop
    }
    return Promise.reject(error);
  }
);

export default api;

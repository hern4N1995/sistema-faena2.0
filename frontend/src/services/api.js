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

// Base tomada de la variable de entorno inyectada por Vite en build time.
// Fallback seguro para desarrollo local si la variable no fue inyectada.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Log temporal para verificar en la consola del navegador qué base se usó en el build.
// Elimina este console.log cuando confirmes que todo funciona.
console.log('API base (build):', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Cambia a true si tu backend usa cookies/sesiones y FRONTEND_ORIGINS está configurado correctamente
  withCredentials: false,
});

// Interceptor para añadir token Authorization si existe
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

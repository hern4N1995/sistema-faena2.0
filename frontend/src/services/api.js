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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  // Habilitar solo si tu backend usa cookies/sesiones con credenciales CORS
  withCredentials: false,
});

// Añade token Authorization si existe
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      // Asegurarse de que headers exista
      config.headers = config.headers || {};
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // Ignorar si localStorage no está disponible (SSR, tests, etc.)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo central de errores (log + rethrow)
// Nota: no transformamos la respuesta para mantener compatibilidad con código
// que espera response.data en los consumidores.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logueo útil para debugging en desarrollo; remover o ajustar en producción
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

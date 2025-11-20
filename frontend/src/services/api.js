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

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // activar solo si usás cookies/sesiones desde el backend
});

// Añade token Authorization si existe
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // ignorar si localStorage no está disponible
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo central de errores (opcional, personalizá según tu app)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ejemplo: loguear y propagar
    console.error(
      'API error:',
      error?.response?.status,
      error?.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;

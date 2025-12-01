// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from 'src/services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Por favor completá email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Esperamos { user: {...}, token: '...' } o similar
      const token = data?.token ?? data?.accessToken ?? null;
      const user = data?.user ?? data ?? null;

      if (!token) throw new Error(data?.message || 'Token no recibido');

      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      // redirigir a dashboard o ruta principal
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Por favor, revisá tus datos.');
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Error al conectar con el servidor.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-800">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Accedé a SIFADECO con tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition transform ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200'
              }`}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            ¿Problemas para ingresar? Contactá al área de sistemas.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ministerio de Producción de Corrientes
        </p>
      </div>
    </div>
  );
}

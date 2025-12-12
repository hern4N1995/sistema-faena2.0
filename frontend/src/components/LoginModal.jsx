// src/components/LoginModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from 'src/services/api';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Por favor completa los campos');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!data?.user || !data?.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      onClose();

      // redirigir según rol (ajustá los casos si es necesario)
      switch (data.user.rol) {
        case 1:
        case 2:
        default:
          navigate('/inicio');
          break;
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Credenciales inválidas o usuario no registrado');
      } else {
        setError(
          err.response?.data?.message || err.message || 'Error desconocido'
        );
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="modal bg-white p-8 rounded-2xl shadow-2xl w-96 relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light transition"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">🔐 Acceso</h2>
          <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            disabled={loading}
          >
            {loading ? '⏳ Ingresando...' : '✓ Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Por favor verifica tus datos y vuelve a intentar
        </p>
      </div>
    </div>
  );
}

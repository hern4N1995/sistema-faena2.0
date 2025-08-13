// src/components/LoginModal.jsx
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // ✅ Limpiar error antes de intentar

    if (!email || !password) {
      setError('Por favor completa los campos');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/login',
        {
          email,
          password,
        }
      );

      const data = response.data;

      if (!data?.user?.email || !data?.user?.rol || !data?.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      onClose();

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
        setError(err.message || 'Error desconocido');
      }
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal bg-white p-6 rounded shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 text-lg font-bold"
        >
          ×
        </button>
        <h2 className="text-xl mb-4 font-bold text-center">Login</h2>

        {error && (
          <div className="text-red-600 bg-red-100 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

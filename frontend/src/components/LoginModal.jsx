import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 👉 Simulador temporal de roles para desarrollo
  const roleMap = {
    'super@admin.com': 'superadmin',
    'admin@admin.com': 'admin',
    'user@user.com': 'usuario',
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuario || !password) {
      setError('Por favor completa los campos');
      return;
    }

    try {
      // 🔧🟨 INTEGRACIÓN REAL CON BACKEND (para tu compañero)
      // Comentado para entorno de desarrollo. Cuando se active el backend, reemplazar este bloque:
      /*
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();

      if (!data?.email || !data?.rol) {
        throw new Error('Respuesta inválida del servidor');
      }
      */

      // 🔁 Simulación local sin conexión backend
      const rol = roleMap[usuario] || 'usuario';
      const data = {
        id: 1,
        email: usuario,
        rol,
        token: 'token-simulado',
      };

      // 🧠 Guardar sesión
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      onClose();

      // 🚪 Redirección por rol
      switch (data.rol) {
        case 'admin':
          navigate('/inicio');
          break;
        case 'superadmin':
          navigate('/inicio');
          break;
        default:
          navigate('/inicio');
          break;
      }
    } catch (err) {
      setError(err.message || 'Error desconocido');
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
        <h2 className="text-xl mb-4 font-bold">Login</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

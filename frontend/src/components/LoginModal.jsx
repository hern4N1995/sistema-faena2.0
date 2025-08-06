// src/components/LoginModal.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usuario || !password) {
      alert('Por favor completa los campos');
      return;
    }

    try {
      // 🔗 INTEGRACIÓN CON BACKEND
      // Reemplazar esta URL con la del endpoint real
      const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: usuario,
      password,
    });

const data = response.data;

      // 🧠 El backend debe responder con algo como:
      // {
      //   id: 1,
      //   email: 'usuario@ejemplo.com',
      //   rol: 'admin' // o 'usuario'
      // }

      // Guardar sesión
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token || 'token-falso');

      onClose();

      // Redirigir según rol
      if (data.rol === 'admin') {
        navigate('/admin/provincias');
      } else {
        navigate('/tropa'); // o la vista principal para usuarios
      }
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal bg-white p-6 rounded shadow-lg w-96">
        <button onClick={onClose} className="float-right text-gray-600">
          X
        </button>
        <h2 className="text-xl mb-4 font-bold">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
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

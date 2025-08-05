import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();

    if (!usuario || !password) {
      alert('Por favor completa los campos');
      return;
    }

    // Guardar sesión simulada
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, email: usuario, rol: 'admin' })
    );
    localStorage.setItem('token', 'token-falso');

    onClose();
    navigate('/admin/provincias');
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

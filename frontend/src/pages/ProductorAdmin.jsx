import React, { useState } from 'react';
import axios from 'axios';

export default function ProductorAdmin() {
  const [nuevoProductor, setNuevoProductor] = useState({
    cuit: '',
    nombre: '',
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProductor({ ...nuevoProductor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await axios.post('/api/productor', nuevoProductor);
      setMensaje(res.data.mensaje);
      setNuevoProductor({ cuit: '', nombre: '' });
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error inesperado');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Agregar Productor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">CUIT</label>
          <input
            type="text"
            name="cuit"
            value={nuevoProductor.cuit}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Ej: 20-12345678-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={nuevoProductor.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Nombre del productor"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
        {mensaje && <p className="mt-2 text-sm text-green-700">{mensaje}</p>}
      </form>
    </div>
  );
}

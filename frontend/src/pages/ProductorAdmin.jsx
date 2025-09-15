import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductorAdmin() {
  const [nuevoProductor, setNuevoProductor] = useState({
    cuit: '',
    nombre: '',
  });
  const [productores, setProductores] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductores();
  }, []);

  const fetchProductores = async () => {
    try {
      const res = await axios.get('/api/productores');
      setProductores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Error al cargar productores');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProductor({ ...nuevoProductor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      if (editandoId) {
        await axios.put(`/api/productores/${editandoId}`, nuevoProductor);
        setMensaje('✅ Productor modificado correctamente');
      } else {
        await axios.post('/api/productores', nuevoProductor);
        setMensaje('✅ Productor agregado correctamente');
      }
      setNuevoProductor({ cuit: '', nombre: '' });
      setEditandoId(null);
      await fetchProductores();
    } catch (err) {
      setError(err.response?.data?.error || '❌ Error inesperado');
    }
  };

  const handleEditar = (prod) => {
    setNuevoProductor({ cuit: prod.cuit, nombre: prod.nombre });
    setEditandoId(prod.id_productor);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este productor?')) return;
    try {
      await axios.delete(`/api/productores/${id}`);
      setMensaje('✅ Productor eliminado correctamente');
      await fetchProductores();
    } catch (err) {
      setError('❌ Error al eliminar productor');
    }
  };

  const productoresFiltrados = productores.filter((p) =>
    `${p.cuit} ${p.nombre}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 border rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">
        {editandoId ? 'Modificar Productor' : 'Agregar Productor'}
      </h2>

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
          {editandoId ? 'Guardar Cambios' : 'Guardar'}
        </button>
        {(mensaje || error) && (
          <p
            className={`mt-2 text-sm ${
              mensaje ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {mensaje || error}
          </p>
        )}
      </form>

      <hr />

      <h3 className="text-lg font-semibold">Productores Registrados</h3>
      <input
        type="text"
        placeholder="Buscar por CUIT o nombre"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full"
      />

      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {productoresFiltrados.length > 0 ? (
          productoresFiltrados.map((p) => (
            <div
              key={p.id_productor}
              className="flex justify-between items-center border rounded px-4 py-2 bg-white"
            >
              <div>
                <strong>{p.nombre}</strong> — CUIT: {p.cuit}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditar(p)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id_productor)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No se encontraron productores.</p>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

const AfeccionesAdmin = () => {
  const [afecciones, setAfecciones] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [idEspecie, setIdEspecie] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAfecciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/afecciones', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('No autorizado');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Formato incorrecto');
      setAfecciones(data);
    } catch (err) {
      console.error('Error al cargar afecciones:', err.message);
      setAfecciones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEspecies = async () => {
    try {
      const res = await fetch('/api/especies');
      const data = await res.json();
      setEspecies(data);
    } catch (err) {
      console.error('Error al cargar especies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAfecciones();
    fetchEspecies();
  }, []);

  const handleGuardar = async () => {
    if (!descripcion.trim() || !idEspecie) {
      alert('Completa todos los campos');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      descripcion,
      id_especie: parseInt(idEspecie),
    };

    try {
      const res = await fetch(
        editandoId ? `/api/afecciones/${editandoId}` : '/api/afecciones',
        {
          method: editandoId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('Error al guardar');
      await fetchAfecciones();
      setDescripcion('');
      setIdEspecie('');
      setEditandoId(null);
      alert(editandoId ? 'Afección actualizada' : 'Afección registrada');
    } catch (err) {
      console.error('Error al guardar afección:', err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta afección?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/afecciones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar');
      await fetchAfecciones();
      alert('Afección eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar afección:', err.message);
    }
  };

  const iniciarEdicion = (a) => {
    setDescripcion(a.descripcion);
    const especie = especies.find((e) => e.nombre === a.especie);
    setIdEspecie(especie?.id || '');
    setEditandoId(a.id_afeccion);
  };

  const cancelarEdicion = () => {
    setDescripcion('');
    setIdEspecie('');
    setEditandoId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
        🧬 Administración de Afecciones
      </h1>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          {editandoId ? 'Modificar afección' : 'Registrar nueva afección'}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <select
            value={idEspecie}
            onChange={(e) => setIdEspecie(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccionar especie</option>
            {especies.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleGuardar}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 font-semibold"
            >
              {editandoId ? 'Actualizar' : 'Guardar Afección'}
            </button>
            {editandoId && (
              <button
                onClick={cancelarEdicion}
                className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 font-semibold"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Afecciones registradas
        </h2>
        {loading ? (
          <p className="text-center text-slate-500">Cargando...</p>
        ) : afecciones.length === 0 ? (
          <p className="text-center text-slate-500">
            No hay afecciones registradas.
          </p>
        ) : (
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="bg-green-700 text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Especie</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {afecciones.map((a) => (
                <tr key={a.id_afeccion} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{a.id_afeccion}</td>
                  <td className="px-4 py-2">{a.descripcion}</td>
                  <td className="px-4 py-2">{a.especie}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => iniciarEdicion(a)}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => handleEliminar(a.id_afeccion)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AfeccionesAdmin;

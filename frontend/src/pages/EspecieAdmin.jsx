import React, { useEffect, useState } from 'react';

export default function EspecieAdmin() {
  const [especies, setEspecies] = useState([]);
  const [form, setForm] = useState({ descripcion: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchEspecies();
  }, []);

  const fetchEspecies = async () => {
    try {
      const res = await fetch('/especies', { headers: getTokenHeaders() });
      const data = await res.json();
      setEspecies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar especies:', err.message);
      setEspecies([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ descripcion: '' });
    setEditandoId(null);
    setMensaje('');
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, descripcion: e.target.value });
  };

  const guardarEspecie = async () => {
    setMensaje('');
    setError('');

    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    const payload = { descripcion: form.descripcion.trim() };
    const url = editandoId ? `/especies/${editandoId}` : '/especies';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getTokenHeaders() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar');
      await fetchEspecies();
      resetForm();
      setMensaje(editandoId ? 'Especie actualizada' : 'Especie registrada');
    } catch (err) {
      console.error('Error al guardar especie:', err.message);
      setError('No se pudo guardar la especie');
    }
  };

  const iniciarEdicion = (e) => {
    setForm({ descripcion: e.descripcion });
    setEditandoId(e.id_especie);
    setMensaje('');
    setError('');
  };

  const eliminarEspecie = async (id) => {
    if (!window.confirm('¿Eliminar esta especie de forma lógica?')) return;

    try {
      const res = await fetch(`/especies/${id}`, {
        method: 'DELETE',
        headers: getTokenHeaders(),
      });

      if (!res.ok) throw new Error('Error al eliminar');
      await fetchEspecies();
      setMensaje('Especie eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar especie:', err.message);
      setError('No se pudo eliminar la especie');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          {editandoId ? 'Modificar especie' : 'Registrar nueva especie'}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex gap-2">
            <button
              onClick={guardarEspecie}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 font-semibold"
            >
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 font-semibold"
              >
                Cancelar
              </button>
            )}
          </div>

          {(mensaje || error) && (
            <p
              className={`text-sm ${
                mensaje ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {mensaje || error}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Especies registradas
        </h2>

        {loading ? (
          <p className="text-center text-slate-500">Cargando...</p>
        ) : especies.length === 0 ? (
          <p className="text-center text-slate-500">
            No hay especies registradas.
          </p>
        ) : (
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="bg-green-700 text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {especies.map((e) => (
                <tr key={e.id_especie} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{e.id_especie}</td>
                  <td className="px-4 py-2">{e.descripcion}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => iniciarEdicion(e)}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => eliminarEspecie(e.id_especie)}
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
}

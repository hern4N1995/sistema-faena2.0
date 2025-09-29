import React, { useEffect, useRef, useState } from 'react';

const AfeccionesAdmin = () => {
  const [afecciones, setAfecciones] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [idEspecie, setIdEspecie] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const descripcionRef = useRef(null);

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAfecciones = async () => {
    try {
      const res = await fetch('/api/afecciones', {
        headers: getTokenHeaders(),
      });
      if (!res.ok) throw new Error(`Afecciones: ${res.status}`);
      const data = await res.json();
      setAfecciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar afecciones:', err);
      setAfecciones([]);
      setError('No se pudieron cargar las afecciones');
    }
  };

  const fetchEspecies = async () => {
    try {
      const res = await fetch('/api/especies', { headers: getTokenHeaders() });
      if (!res.ok) throw new Error(`Especies: ${res.status}`);
      const data = await res.json();
      setEspecies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar especies:', err);
      setEspecies([]);
      setError((prev) => prev || 'No se pudieron cargar las especies');
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      await Promise.all([fetchAfecciones(), fetchEspecies()]);
      if (mounted) setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // cuando se selecciona especie en modo creación, enfocamos descripción
  useEffect(() => {
    if (idEspecie && !editandoId) {
      descripcionRef.current?.focus();
    }
  }, [idEspecie, editandoId]);

  const handleGuardar = async () => {
    if (!idEspecie) {
      alert('Primero seleccioná una especie');
      return;
    }
    if (!descripcion.trim()) {
      alert('Completá la descripción');
      return;
    }

    const payload = {
      descripcion: descripcion.trim(),
      id_especie: parseInt(idEspecie, 10),
    };

    try {
      const res = await fetch(
        editandoId ? `/api/afecciones/${editandoId}` : '/api/afecciones',
        {
          method: editandoId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getTokenHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Error al guardar: ${res.status} ${text}`);
      }

      await fetchAfecciones();
      setDescripcion('');
      setIdEspecie('');
      setEditandoId(null);
      alert(editandoId ? 'Afección actualizada' : 'Afección registrada');
    } catch (err) {
      console.error('Error al guardar afección:', err);
      alert('No se pudo guardar la afección');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta afección?')) return;

    try {
      const res = await fetch(`/api/afecciones/${id}`, {
        method: 'DELETE',
        headers: getTokenHeaders(),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Error al eliminar: ${res.status} ${text}`);
      }

      await fetchAfecciones();
      alert('Afección eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar afección:', err);
      alert('No se pudo eliminar la afección');
    }
  };

  const iniciarEdicion = (a) => {
    setDescripcion(a.descripcion || '');
    if (a.id_especie) {
      setIdEspecie(String(a.id_especie));
    } else if (a.especie) {
      const especie = especies.find((e) => {
        const nombre = e.descripcion ?? e.nombre ?? '';
        return nombre === a.especie;
      });
      setIdEspecie(especie ? String(especie.id_especie ?? especie.id) : '');
    } else {
      setIdEspecie('');
    }
    setEditandoId(a.id_afeccion ?? a.id);
    setTimeout(() => descripcionRef.current?.focus(), 100);
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
          {/* 1) Selector de especie: obligatorio y primero */}
          <label className="block text-sm text-slate-600">
            1. Seleccioná la especie
          </label>
          <select
            value={idEspecie}
            onChange={(e) => setIdEspecie(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccionar especie</option>
            {Array.isArray(especies) &&
              especies.map((e) => {
                const id = e.id_especie ?? e.id;
                const label = e.descripcion ?? e.nombre ?? '';
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
          </select>

          {/* 2) Descripción habilitada solo si hay especie */}
          <label className="block text-sm text-slate-600">
            2. Ingresá el nombre de la afección
          </label>
          <input
            ref={descripcionRef}
            type="text"
            placeholder={
              idEspecie
                ? 'Descripción de la afección'
                : 'Seleccioná primero una especie'
            }
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={!idEspecie}
            className={`w-full border rounded px-3 py-2 ${
              !idEspecie ? 'bg-slate-100 cursor-not-allowed' : ''
            }`}
          />

          <div className="flex gap-2">
            <button
              onClick={handleGuardar}
              disabled={!idEspecie || !descripcion.trim()}
              className={`px-4 py-2 rounded font-semibold ${
                idEspecie && descripcion.trim()
                  ? 'bg-green-700 text-white hover:bg-green-800'
                  : 'bg-slate-400 text-white cursor-not-allowed'
              }`}
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

          {error && <p className="text-sm text-red-600">{error}</p>}
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
              {afecciones.map((a) => {
                const id = a.id_afeccion ?? a.id;
                return (
                  <tr key={id} className="border-b last:border-b-0">
                    <td className="px-4 py-2">{id}</td>
                    <td className="px-4 py-2">{a.descripcion}</td>
                    <td className="px-4 py-2">
                      {a.especie ?? a.nombre_especie ?? ''}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => iniciarEdicion(a)}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Modificar
                      </button>
                      <button
                        onClick={() => handleEliminar(id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AfeccionesAdmin;

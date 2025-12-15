import React, { useEffect, useRef, useState, useMemo } from 'react';
import Select from 'react-select';
import api from 'src/services/api';

/* ------------------------------------------------------------------ */
/*  SelectField estilizado                                            */
/* ------------------------------------------------------------------ */
function SelectField({ label, value, onChange, options, placeholder }) {
  const [isFocusing, setIsFocusing] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      minHeight: '48px',
      paddingLeft: '16px',
      paddingRight: '16px',
      backgroundColor: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: isFocusing
        ? '0 0 0 1px #000'
        : state.isFocused
        ? '0 0 0 4px #d1fae5'
        : 'none',
      transition: 'all 100ms ease',
      '&:hover': {
        borderColor: '#6ee7b7',
      },
      '&:focus-within': {
        borderColor: '#10b981',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 0 0 2px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontSize: '14px',
      fontFamily: 'inherit',
      color: '#111827',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '14px',
      color: '#111827',
      margin: 0,
      top: 'initial',
      transform: 'none',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '48px',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      fontSize: '14px',
      padding: '10px 16px',
      backgroundColor: isFocused ? '#d1fae5' : '#fff',
      color: isFocused ? '#065f46' : '#111827',
    }),
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 font-semibold text-gray-700 text-sm">
        {label}
      </label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        styles={customStyles}
        noOptionsMessage={() => 'Sin opciones'}
        components={{ IndicatorSeparator: () => null }}
        onFocus={() => {
          setIsFocusing(true);
          setTimeout(() => setIsFocusing(false), 50);
        }}
      />
    </div>
  );
}

const AfeccionesAdmin = () => {
  const [afecciones, setAfecciones] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [idEspecie, setIdEspecie] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPayload, setEditingPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const descripcionRef = useRef(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = window.innerWidth < 768 ? 2 : 4;

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  const fetchAfecciones = async () => {
    try {
      const res = await api.get('/afecciones', { timeout: 10000 });
      const data = res?.data ?? [];
      setAfecciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching afecciones:', err);
      setError('No se pudieron cargar las afecciones');
    }
  };

  const fetchEspecies = async () => {
    try {
      const res = await api.get('/especies', { timeout: 10000 });
      const data = res?.data ?? [];
      setEspecies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching especies:', err);
      setError('No se pudieron cargar las especies');
    }
  };

  useEffect(() => {
    if (idEspecie && !editandoId) {
      descripcionRef.current?.focus();
    }
  }, [idEspecie, editandoId]);

  const iniciarEdicion = (a) => {
    // Open modal editor with isolated payload to avoid mutating top form
    const especieId = a.id_especie ?? especies.find((e) => e.descripcion === a.especie)?.id;
    setEditingPayload({
      id: a.id_afeccion ?? a.id,
      descripcion: a.descripcion || '',
      id_especie: String(especieId ?? ''),
    });
    setEditModalOpen(true);
  };

  const cancelarEdicion = () => {
    setDescripcion('');
    setIdEspecie('');
    setEditandoId(null);
  };

  const guardarEdicionModal = async () => {
    if (!editingPayload?.id) return;
    if (!editingPayload.id_especie || !editingPayload.descripcion?.trim()) return;
    const payload = {
      descripcion: editingPayload.descripcion.trim(),
      id_especie: parseInt(editingPayload.id_especie, 10),
    };
    try {
      const res = await api.put(`/afecciones/${editingPayload.id}`, payload, { timeout: 10000 });
      if (!(res && res.status >= 200 && res.status < 300)) throw new Error('Error al guardar');
      await fetchAfecciones();
      setEditModalOpen(false);
      setEditingPayload(null);
      alert('Afección actualizada');
    } catch (err) {
      console.error('No se pudo guardar la afección (modal):', err);
      alert('No se pudo guardar la afección');
    }
  };

  const handleGuardar = async () => {
    if (!idEspecie || !descripcion.trim()) return;

    const payload = {
      descripcion: descripcion.trim(),
      id_especie: parseInt(idEspecie, 10),
    };

    try {
      let res;
      if (editandoId) {
        res = await api.put(`/afecciones/${editandoId}`, payload, {
          timeout: 10000,
        });
      } else {
        res = await api.post('/afecciones', payload, { timeout: 10000 });
      }
      if (!(res && res.status >= 200 && res.status < 300))
        throw new Error('Error al guardar');
      await fetchAfecciones();
      cancelarEdicion();
      alert(editandoId ? 'Afección actualizada' : 'Afección registrada');
    } catch {
      alert('No se pudo guardar la afección');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta afección?')) return;
    try {
      const res = await api.delete(`/afecciones/${id}`, { timeout: 10000 });
      if (!(res && res.status >= 200 && res.status < 300))
        throw new Error('Error al eliminar');
      await fetchAfecciones();
      alert('Afección eliminada correctamente');
    } catch {
      alert('No se pudo eliminar la afección');
    }
  };

  const visibles = useMemo(() => {
    return afecciones.slice(
      (paginaActual - 1) * itemsPorPagina,
      paginaActual * itemsPorPagina
    );
  }, [afecciones, paginaActual]);

  const totalPaginas = Math.ceil(afecciones.length / itemsPorPagina);
  const irPagina = (n) =>
    setPaginaActual(Math.min(Math.max(n, 1), totalPaginas));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
          🧬 Administración de Afecciones
        </h1>
        {/* Formulario institucional con sombra visible */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 space-y-4 mt-6 relative z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            {editandoId ? 'Modificar afección' : 'Registrar nueva afección'}
          </h2>

          <SelectField
            label="1. Seleccioná la especie"
            value={
              especies.find((e) => String(e.id_especie ?? e.id) === idEspecie)
                ? {
                    value: idEspecie,
                    label:
                      especies.find(
                        (e) => String(e.id_especie ?? e.id) === idEspecie
                      )?.descripcion ?? 'Especie',
                  }
                : null
            }
            onChange={(selected) => setIdEspecie(selected?.value || '')}
            options={especies.map((e) => ({
              value: String(e.id_especie ?? e.id),
              label: e.descripcion ?? e.nombre ?? '',
            }))}
            placeholder="Seleccionar especie"
          />

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 text-sm">
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
              className={`w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 ${
                !idEspecie ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'
              }`}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleGuardar}
              disabled={!idEspecie || !descripcion.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition shadow ${
                idEspecie && descripcion.trim()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {editandoId ? 'Actualizar' : 'Guardar Afección'}
            </button>

            {editandoId && (
              <button
                onClick={cancelarEdicion}
                className="px-6 py-3 bg-slate-500 text-white rounded-lg font-semibold hover:bg-slate-600 transition shadow"
              >
                Cancelar
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Tarjetas responsivas en móvil */}
        <div className="sm:hidden space-y-4">
          {visibles.map((a) => {
            const id = a.id_afeccion ?? a.id;
            return (
              <div
                key={id}
                className="bg-white p-4 rounded-xl shadow border border-gray-200"
              >
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold text-green-700">
                      {a.descripcion}
                    </span>
                  </p>
                  <p>
                    Especie:{' '}
                    <span className="font-medium text-gray-800">
                      {a.especie ?? a.nombre_especie ?? ''}
                    </span>
                  </p>
                  <p className="text-gray-500">ID: {id}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => iniciarEdicion(a)}
                    className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => handleEliminar(id)}
                    className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabla en desktop */}
        <div className="hidden sm:block overflow-x-auto rounded-xl shadow-xl ring-1 ring-gray-200">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left font-semibold">Especie</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibles.map((a) => {
                const id = a.id_afeccion ?? a.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{id}</td>
                    <td className="px-4 py-3">{a.descripcion}</td>
                    <td className="px-4 py-3">
                      {a.especie ?? a.nombre_especie ?? ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => iniciarEdicion(a)}
                          className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                        >
                          ✏️ Modificar
                        </button>
                        <button
                          onClick={() => handleEliminar(id)}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación externa */}
        {totalPaginas > 1 && (
          <div className="mt-[-4px] flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => irPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                paginaActual === 1
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
              }`}
            >
              ← Anterior
            </button>

            {[...Array(Math.min(3, totalPaginas))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => irPagina(page)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                    paginaActual === page
                      ? 'bg-green-700 text-white shadow'
                      : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {totalPaginas > 3 && (
              <>
                <span className="text-slate-500 text-sm">…</span>
                <button
                  onClick={() => irPagina(totalPaginas)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                    paginaActual === totalPaginas
                      ? 'bg-green-700 text-white shadow'
                      : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
                  }`}
                >
                  {totalPaginas}
                </button>
              </>
            )}

            <button
              onClick={() => irPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                paginaActual === totalPaginas
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
              }`}
            >
              Siguiente →
            </button>
          </div>
        )}
        {/* Edit modal overlay */}
        {editModalOpen && editingPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setEditModalOpen(false); setEditingPayload(null); }} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Editar Afección</h3>
              <div className="space-y-3">
                <div>
                  <SelectField
                    label="Especie"
                    value={
                      especies.find((e) => String(e.id_especie ?? e.id) === String(editingPayload.id_especie))
                        ? { value: String(editingPayload.id_especie), label: especies.find((e) => String(e.id_especie ?? e.id) === String(editingPayload.id_especie))?.descripcion }
                        : null
                    }
                    onChange={(sel) => setEditingPayload((p) => ({ ...p, id_especie: sel?.value || '' }))}
                    options={especies.map((e) => ({ value: String(e.id_especie ?? e.id), label: e.descripcion ?? e.nombre || '' }))}
                    placeholder="Seleccionar especie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
                    value={editingPayload.descripcion}
                    onChange={(e) => setEditingPayload((p) => ({ ...p, descripcion: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => { setEditModalOpen(false); setEditingPayload(null); }} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={guardarEdicionModal} className="px-4 py-2 bg-green-600 text-white rounded">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AfeccionesAdmin;

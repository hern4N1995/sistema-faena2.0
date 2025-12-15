import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import api from 'src/services/api';

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
      transition: 'all 50ms ease',
      '&:hover': {
        borderColor: '#96f1b7',
      },
      '&:focus-within': {
        borderColor: '#22c55e',
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
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '14px',
      color: '#6b7280',
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

export default function TitularAdmin() {
  const [titulares, setTitulares] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [nuevoTitular, setNuevoTitular] = useState({
    nombre: '',
    provincia: null,
    localidad: '',
    direccion: '',
    documento: '',
  });
  const formRef = useRef(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  const [mensajeFeedback, setMensajeFeedback] = useState('');
  // Modal state for edit and confirm
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPayload, setEditingPayload] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = esMovil ? 4 : 6;

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function cargarDatos() {
      try {
        // Pedidos en paralelo con axios (usa baseURL de src/services/api)
        const [resProvincias, resTitulares] = await Promise.all([
          api.get('/provincias', { timeout: 10000 }),
          api.get('/titulares-faena', { timeout: 10000 }),
        ]);

        if (!mounted) return;

        const provincias = resProvincias?.data ?? [];
        const titularesData = resTitulares?.data ?? [];

        setProvinciasDB(Array.isArray(provincias) ? provincias : []);
        setTitulares(Array.isArray(titularesData) ? titularesData : []);
      } catch (err) {
        if (!mounted) return;
        // Ignorar cancelaciones si las hubiera
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        console.error('Error al cargar datos:', err);
        setMensajeFeedback(
          '❌ Error al cargar datos. Revisá la conexión o el servidor.'
        );
        setTimeout(() => setMensajeFeedback(''), 4000);
      }
    }

    cargarDatos();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoTitular({ ...nuevoTitular, [name]: value });
  };

  const handleProvinciaChange = (selected) => {
    setNuevoTitular({ ...nuevoTitular, provincia: selected });
  };

  /* ---------- Agregar titular ---------- */
  const agregarTitular = async () => {
    // If editing, delegate to guardarEdicion
    if (editandoId) {
      await guardarEdicion();
      return;
    }
    if (
      !nuevoTitular.nombre ||
      !nuevoTitular.provincia ||
      !nuevoTitular.localidad
    ) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      const payload = {
        nombre: nuevoTitular.nombre,
        id_provincia:
          Number.parseInt(
            nuevoTitular.provincia?.value ?? nuevoTitular.provincia,
            10
          ) || null,
        localidad: nuevoTitular.localidad,
        direccion: nuevoTitular.direccion || '',
        documento: nuevoTitular.documento || '',
      };

      const res = await api.post('/titulares-faena', payload, {
        timeout: 10000,
      });
      const data = res?.data ?? null;

      if (data) {
        // Ensure provincia text is present (API may return only id_provincia)
        const provinciaDesc = provinciasDB.find(
          (p) => String(p.id) === String(data.id_provincia)
        )?.descripcion;
        const dataWithProvincia = {
          ...data,
          provincia:
            data.provincia ??
            provinciaDesc ??
            (nuevoTitular.provincia?.label || ''),
        };
        setTitulares((prev) =>
          Array.isArray(prev)
            ? [...prev, dataWithProvincia]
            : [dataWithProvincia]
        );
        setNuevoTitular({
          nombre: '',
          provincia: null,
          localidad: '',
          direccion: '',
          documento: '',
        });
        setPaginaActual(1);
      } else {
        // fallback: recargar lista si la API no devuelve el recurso creado
        const listRes = await api.get('/titulares-faena', { timeout: 10000 });
        setTitulares(Array.isArray(listRes.data) ? listRes.data : []);
        setPaginaActual(1);
      }
    } catch (error) {
      console.error('Error al agregar titular:', error);
      // mostrar feedback al usuario si querés:
      // openErrorModal('No se pudo agregar titular', error?.response?.data?.message || error.message);
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditado({});
    setNuevoTitular({
      nombre: '',
      provincia: null,
      localidad: '',
      direccion: '',
      documento: '',
    });
  };

  const iniciarEdicion = (t) => {
    // open overlay modal for editing
    const provinciaOption = provinciasDB.find(
      (p) => String(p.id) === String(t.id_provincia) || p.descripcion === t.provincia
    );
    const payload = {
      id: t.id,
      nombre: t.nombre || '',
      provincia: provinciaOption ? { value: provinciaOption.id, label: provinciaOption.descripcion } : null,
      localidad: t.localidad || '',
      direccion: t.direccion || '',
      documento: t.documento || '',
    };
    setEditingPayload(payload);
    setEditModalOpen(true);
  };

  /* ---------- Guardar edición de titular (usando el formulario superior) ---------- */
  const guardarEdicion = async () => {
    if (!editingPayload?.id) return;
    try {
      const payload = {
        nombre: editingPayload.nombre,
        id_provincia: Number.parseInt(editingPayload.provincia?.value ?? editingPayload.provincia, 10) || null,
        localidad: editingPayload.localidad,
        direccion: editingPayload.direccion || '',
        documento: editingPayload.documento || '',
      };

      const res = await api.put(`/titulares-faena/${editingPayload.id}`, payload, { timeout: 10000 });
      let updated = res?.data ?? { ...payload, id: editingPayload.id };
      const provinciaDesc2 = provinciasDB.find((p) => String(p.id) === String(updated.id_provincia))?.descripcion;
      updated = { ...updated, provincia: updated.provincia ?? provinciaDesc2 ?? (editingPayload.provincia?.label || '') };

      setTitulares((prev) => (Array.isArray(prev) ? prev.map((t) => (String(t.id) === String(editingPayload.id) ? { ...t, ...updated } : t)) : prev));
      setEditModalOpen(false);
      setEditingPayload(null);
      setMensajeFeedback('✅ Cambios guardados.');
      setTimeout(() => setMensajeFeedback(''), 3000);
    } catch (error) {
      console.error('Error al guardar edición:', error);
    }
  };

  /* ---------- Eliminar titular ---------- */
  const eliminarTitular = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const performDeleteTitular = async (id) => {
    try {
      const res = await api.delete(`/titulares-faena/${id}`, { timeout: 10000 });
      const status = res?.status ?? 0;
      if (status >= 200 && status < 300) {
        setTitulares((prev) => (Array.isArray(prev) ? prev.filter((t) => String(t.id) !== String(id)) : []));
        setPaginaActual(1);
        setMensajeFeedback('✅ Titular eliminado.');
        setTimeout(() => setMensajeFeedback(''), 3000);
      }
    } catch (error) {
      console.error('Error al eliminar titular:', error);
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const totalPaginas = Math.ceil(titulares.length / itemsPorPagina);
  const visibles = titulares.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const irPagina = (n) =>
    setPaginaActual(Math.min(Math.max(n, 1), totalPaginas));
  const paginaAnterior = () => irPagina(paginaActual - 1);
  const paginaSiguiente = () => irPagina(paginaActual + 1);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 drop-shadow">
          🧾 Administración de Titulares de Faena
        </h1>

        {/* Formulario */}
        <div
          ref={formRef}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bloque superior */}
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Nombre / Razón Social
              </label>
              <input
                name="nombre"
                value={nuevoTitular.nombre}
                onChange={handleChange}
                placeholder="Nombre o Razón Social"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <SelectField
              label="Provincia"
              value={nuevoTitular.provincia}
              onChange={handleProvinciaChange}
              options={provinciasDB.map((p) => ({
                value: p.id,
                label: p.descripcion,
              }))}
              placeholder="Seleccione una provincia"
            />

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Localidad
              </label>
              <input
                name="localidad"
                value={nuevoTitular.localidad}
                onChange={handleChange}
                placeholder="Ej. Corrientes, Goya, etc."
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            {/* Bloque inferior */}
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Dirección
              </label>
              <input
                name="direccion"
                value={nuevoTitular.direccion}
                onChange={handleChange}
                placeholder="Ej. Calle Falsa 123"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                DNI / CUIT
              </label>
              <input
                name="documento"
                value={nuevoTitular.documento}
                onChange={handleChange}
                placeholder="Ej. 12345678 o 20-12345678-3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={agregarTitular}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition text-sm font-semibold shadow"
              >
                {editandoId ? '💾 Guardar' : '➕ Agregar'}
              </button>
              {editandoId && (
                <button
                  onClick={cancelarEdicion}
                  className="w-full bg-slate-200 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-300 transition text-sm font-semibold shadow"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Edit modal overlay */}
        {editModalOpen && editingPayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Editar Titular</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editingPayload.nombre}
                    onChange={(e) => setEditingPayload((p) => ({ ...p, nombre: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provincia</label>
                  <Select
                    styles={{}}
                    value={editingPayload.provincia}
                    onChange={(sel) => setEditingPayload((p) => ({ ...p, provincia: sel }))}
                    options={provinciasDB.map((p) => ({ value: p.id, label: p.descripcion }))}
                    placeholder="Seleccione..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Localidad</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editingPayload.localidad}
                    onChange={(e) => setEditingPayload((p) => ({ ...p, localidad: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editingPayload.direccion}
                    onChange={(e) => setEditingPayload((p) => ({ ...p, direccion: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">DNI/CUIT</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editingPayload.documento}
                    onChange={(e) => setEditingPayload((p) => ({ ...p, documento: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={guardarEdicion} className="px-4 py-2 bg-green-600 text-white rounded">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm modal */}
        {confirmDelete.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete({ open: false, id: null })} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirmar eliminación</h3>
              <div className="text-sm text-gray-700 mb-6">¿Estás seguro que querés eliminar este titular?</div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete({ open: false, id: null })} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={() => performDeleteTitular(confirmDelete.id)} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Listado */}
        {esMovil ? (
          <div className="space-y-4">
            {visibles.map((t) => (
              <div
                key={t.id}
                className="bg-white p-4 rounded-xl shadow border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-1 text-sm text-gray-700">
                    <p className="font-semibold text-gray-800">{t.nombre}</p>
                    <p>
                      {t.provincia} — {t.localidad}
                    </p>
                    <p>{t.direccion}</p>
                    <p>DNI/CUIT: {t.documento}</p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {editandoId === t.id ? (
                      <button
                        onClick={guardarEdicion}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                      >
                        💾
                      </button>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(t)}
                        className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => eliminarTitular(t.id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200 shadow-xl">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Provincia
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Localidad
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    DNI/CUIT
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibles.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{t.nombre}</td>
                    <td className="px-4 py-3">{t.provincia}</td>
                    <td className="px-4 py-3">{t.localidad}</td>
                    <td className="px-4 py-3">{t.direccion}</td>
                    <td className="px-4 py-3">{t.documento}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => iniciarEdicion(t)}
                          className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => eliminarTitular(t.id)}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación externa */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={paginaAnterior}
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
              onClick={paginaSiguiente}
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
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import api from 'src/services/api';

/* ---------- SelectField (estilos consistentes) ---------- */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxMenuHeight = 200,
  isDisabled = false,
}) {
  const [isFocusing, setIsFocusing] = useState(false);
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      minHeight: '48px',
      paddingLeft: '16px',
      paddingRight: '16px',
      backgroundColor: isDisabled ? '#f3f4f6' : '#f9fafb',
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
      display: 'flex',
      alignItems: 'center',
      cursor: isDisabled ? 'not-allowed' : 'default',
      opacity: isDisabled ? 0.85 : 1,
      fontSize: '14px',
    }),
    valueContainer: (base) => ({
      ...base,
      height: '48px',
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
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
      margin: 0,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      fontSize: '14px',
      padding: '8px 12px',
      backgroundColor: isFocused ? '#d1fae5' : '#fff',
      color: isFocused ? '#065f46' : '#111827',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)',
    }),
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-2 font-semibold text-gray-700 text-sm">
          {label}
        </label>
      )}
      <Select
        value={value ?? null}
        onChange={(sel) => onChange(sel ?? null)}
        options={options}
        placeholder={placeholder}
        maxMenuHeight={maxMenuHeight}
        styles={customStyles}
        noOptionsMessage={() => 'Sin opciones'}
        components={{ IndicatorSeparator: () => null }}
        isDisabled={isDisabled}
        onFocus={() => {
          if (!isDisabled) {
            setIsFocusing(true);
            setTimeout(() => setIsFocusing(false), 50);
          }
        }}
      />
    </div>
  );
}

/* ---------- Modal simple ---------- */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg z-10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/* ---------- Paginación compacta ---------- */
const Paginacion = ({ currentPage, totalPages, onPageChange }) => {
  const goPrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const goNext = () =>
    currentPage < totalPages && onPageChange(currentPage + 1);

  const renderPages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
            i === currentPage
              ? 'bg-green-700 text-white shadow'
              : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
      <button
        onClick={goPrev}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
          currentPage === 1
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
            : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
        }`}
      >
        ← Anterior
      </button>
      {renderPages()}
      <button
        onClick={goNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
          currentPage === totalPages
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
            : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
        }`}
      >
        Siguiente →
      </button>
    </div>
  );
};

/* ---------- Componente principal ---------- */
export default function DepartamentoAdmin() {
  const [registros, setRegistros] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [provinciaIdSeleccionada, setProvinciaIdSeleccionada] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deviceType, setDeviceType] = useState('desktop');

  // edición (modal)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState({
    id_departamento: null,
    id_provincia: null,
    provinciaLabel: '',
    departamento: '',
  });
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const itemsPerPage =
    deviceType === 'mobile' ? 5 : deviceType === 'tablet' ? 8 : 12;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const controller = new AbortController();
    const signal = controller.signal;

    async function cargarDatos() {
      try {
        const timeout = (ms, promise) =>
          Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), ms)
            ),
          ]);

        const reqDeptos = fetch(`${API}/departamentos`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal,
        });
        const reqProvincias = fetch(`${API}/provincias`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal,
        });

        const [resDeptos, resProvincias] = await timeout(
          10000,
          Promise.all([reqDeptos, reqProvincias])
        );

        if (!resDeptos.ok) {
          const text = await resDeptos.text();
          throw new Error(`Departamentos API ${resDeptos.status}: ${text}`);
        }
        if (!resProvincias.ok) {
          const text = await resProvincias.text();
          throw new Error(`Provincias API ${resProvincias.status}: ${text}`);
        }

        const departamentos = await resDeptos.json();
        const provincias = await resProvincias.json();

        setRegistros(
          Array.isArray(departamentos)
            ? departamentos.filter((d) => d.activo !== false)
            : []
        );
        setProvinciasDB(Array.isArray(provincias) ? provincias : []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Carga de datos falló:', err);
        setMensajeFeedback('❌ Error al conectar con el servidor.');
        setTimeout(() => setMensajeFeedback(''), 4000);
      }
    }

    cargarDatos();

    return () => controller.abort();
  }, []);

  const provinciasOptions = useMemo(() => {
    return provinciasDB
      .filter((p) => p && (p.id != null || p.id_provincia != null))
      .map((p) => ({
        value: p.id ?? p.id_provincia,
        label: p.descripcion ?? p.nombre,
      }));
  }, [provinciasDB]);

  const paginatedRegistros = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return registros.slice(start, start + itemsPerPage);
  }, [registros, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(registros.length / itemsPerPage));

  // normalizador (trim, lower)
  const norm = (s) =>
    String(s || '')
      .trim()
      .toLowerCase();

  /* ---------- Agregar departamento ---------- */
  const agregarDepartamento = async () => {
    const nombre = departamentoInput.trim();
    if (
      !provinciaIdSeleccionada ||
      isNaN(parseInt(provinciaIdSeleccionada, 10)) ||
      !nombre
    ) {
      setMensajeFeedback('❌ Completá ambos campos correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }

    // validación cliente: no duplicados en misma provincia
    const exists = registros.some(
      (r) =>
        String(r.id_provincia ?? r.provincia_id ?? '') ===
          String(provinciaIdSeleccionada) &&
        norm(r.departamento) === norm(nombre)
    );
    if (exists) {
      setMensajeFeedback('❌ El departamento ya existe en esa provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }

    try {
      const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      const fetchWithTimeout = (url, options = {}, timeout = 10000) =>
        Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
          ),
        ]);

      try {
        const res = await fetchWithTimeout(
          `${API}/departamentos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre_departamento: nombre,
              id_provincia: Number(provinciaIdSeleccionada),
            }),
            // credentials: 'include' // descomentar si usás cookies/sesiones
          },
          10000
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        // manejar data (p. ej. actualizar estado)
      } catch (err) {
        console.error('Error al crear departamento:', err);
        // mostrar feedback al usuario si corresponde
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setRegistros((prev) => [...prev, data]);
        setProvinciaSeleccionada('');
        setProvinciaIdSeleccionada('');
        setDepartamentoInput('');
        setMensajeFeedback('✅ Departamento agregado correctamente.');
      } else {
        setMensajeFeedback(`❌ ${data.error || 'Error al guardar.'}`);
      }
    } catch (error) {
      setMensajeFeedback('❌ Error de conexión con el servidor.');
    }
    setTimeout(() => setMensajeFeedback(''), 4000);
  };

  /* ---------- Abrir modal de edición (pre-cargar provincia y nombre) ---------- */
  // helper: intenta pedir la provincia por id si no la tenemos en memoria

  async function fetchProvinciaById(id) {
    if (!id) return null;

    try {
      const { data } = await api.get(`/provincias/${id}`);
      // Normalizar distintos formatos que pueda devolver la API
      // Puede ser: { descripcion, nombre, id_provincia } o { data: { ... } } o directamente entidad
      const payload = data?.data ?? data;

      if (!payload) return null;

      const descripcion =
        payload.descripcion ??
        payload.nombre ??
        payload.descripcion_provincia ??
        null;

      const idProv =
        payload.id_provincia ?? payload.id ?? payload.provinciaId ?? null;

      if (!descripcion && !idProv) return null;

      return {
        id: idProv,
        descripcion,
        raw: payload,
      };
    } catch (err) {
      // console.error('fetchProvinciaById error:', err); // opcional: habilitar para debugging
      return null;
    }
  }

  /* Abrir modal de edición (resuelve siempre la provinciaLabel a partir del id) */
  const openEdit = async (r) => {
    setEditError('');

    // normalizamos posibles nombres del id de provincia
    const posibleId =
      r.id_provincia ?? r.provincia_id ?? r.id_provincia ?? r.id ?? null;

    // si viene label en el registro, la usamos; si no, intentamos resolver por id en provinciasOptions
    let posibleLabel =
      r.provincia ?? r.provincia_nombre ?? r.provinciaLabel ?? '';

    if ((!posibleLabel || posibleLabel === '') && posibleId != null) {
      // buscar en las opciones ya cargadas
      const found = provinciasOptions.find(
        (o) => String(o.value) === String(posibleId)
      );
      if (found) {
        posibleLabel = found.label;
      } else {
        // fallback: pedir la provincia al backend por id (por si no estaba en el listado)
        const fetchedLabel = await fetchProvinciaById(posibleId).catch(
          () => null
        );
        if (fetchedLabel) posibleLabel = fetchedLabel;
      }
    }

    setEditing({
      id_departamento: r.id_departamento ?? r.id ?? null,
      id_provincia: posibleId != null ? String(posibleId) : null,
      provinciaLabel: posibleLabel || '',
      departamento: r.departamento ?? r.nombre_departamento ?? r.nombre ?? '',
    });

    setEditModalOpen(true);
  };

  /* ---------- Guardar edición: valida unicidad excluyendo el propio registro ---------- */
  /* ---------- Guardar edición: valida unicidad excluyendo el propio registro ---------- */
  const saveEdit = async () => {
    setEditError('');

    const id = editing.id_departamento;
    const nombre = String(editing.departamento || '').trim();
    let idProv = editing.id_provincia;

    // si id_provincia no está presente, intentar resolverlo por provinciaLabel
    if (
      (!idProv || idProv === 'null' || idProv === '') &&
      editing.provinciaLabel
    ) {
      const found = provinciasOptions.find(
        (o) =>
          String(o.label).trim().toLowerCase() ===
          String(editing.provinciaLabel).trim().toLowerCase()
      );
      if (found) idProv = found.value;
      else {
        // como último recurso, consultar al backend por label (si tu API soporta)
        // omitimos ese paso por ahora y forzamos error si no se puede resolver
      }
    }

    if (!id || !idProv || !nombre) {
      setEditError('Completá provincia y nombre correctamente.');
      return;
    }

    // normalizador
    const norm = (s) =>
      String(s || '')
        .trim()
        .toLowerCase();

    // validar duplicado (excluye propio registro)
    const dup = registros.some(
      (r) =>
        String(r.id_departamento ?? r.id) !== String(id) &&
        String(r.id_provincia ?? r.provincia_id ?? '') === String(idProv) &&
        norm(r.departamento ?? r.nombre_departamento ?? '') === norm(nombre)
    );
    if (dup) {
      setEditError(
        'Ya existe un departamento con ese nombre en la misma provincia.'
      );
      return;
    }

    const handleSaveEdit = async ({ id, nombre, idProv }) => {
      setSavingEdit(true);
      try {
        const idProvNum = Number(idProv);
        const { data } = await api.put(`/departamentos/${id}`, {
          nombre_departamento: nombre,
          id_provincia: Number.isNaN(idProvNum) ? null : idProvNum,
        });

        // Asumimos que la API devuelve el recurso actualizado en `data`
        const result = data ?? {};

        // resolver label (por si vino solo idProv)
        const provinciaLabel =
          provinciasOptions.find((o) => String(o.value) === String(idProv))
            ?.label ??
          editing.provinciaLabel ??
          result.provincia ??
          '';

        setRegistros((prev) =>
          prev.map((r) =>
            String(r.id_departamento ?? r.id) === String(id)
              ? {
                  ...r,
                  departamento: nombre,
                  id_provincia: Number.isNaN(idProvNum)
                    ? r.id_provincia
                    : idProvNum,
                  provincia: provinciaLabel,
                }
              : r
          )
        );

        // actualizar editing para que la próxima vez que abras tenga la label
        setEditing((p) => ({
          ...p,
          provinciaLabel: provinciaLabel || p.provinciaLabel,
          id_provincia: String(idProv ?? p.id_provincia ?? ''),
        }));

        setMensajeFeedback('✅ Departamento modificado.');
        setEditModalOpen(false);
      } catch (err) {
        console.error('Error al modificar departamento:', err);

        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Error de conexión con el servidor.';
        setEditError(msg);
      } finally {
        setSavingEdit(false);
        setTimeout(() => setMensajeFeedback(''), 3500);
      }
    };

    const eliminarDepartamento = async (id) => {
      if (!window.confirm('¿Está seguro de eliminar este departamento?'))
        return;

      try {
        const { status, data } = await api.delete(`/departamentos/${id}`);

        if (status >= 200 && status < 300) {
          setRegistros((prev) =>
            prev.filter((r) => String(r.id_departamento ?? r.id) !== String(id))
          );
          setMensajeFeedback('✅ Departamento eliminado.');
        } else {
          const msg = data?.message || data?.error || 'Error al eliminar.';
          setMensajeFeedback(`❌ ${msg}`);
        }
      } catch (err) {
        console.error('Error al eliminar departamento:', err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Error de conexión con el servidor.';
        setMensajeFeedback(`❌ ${msg}`);
      } finally {
        setTimeout(() => setMensajeFeedback(''), 3500);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
            🗂️ Administración de Departamentos
          </h1>

          {/* Formulario agregar */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="Provincia"
                value={
                  provinciaIdSeleccionada
                    ? {
                        value: provinciaIdSeleccionada,
                        label: provinciaSeleccionada,
                      }
                    : null
                }
                onChange={(selected) => {
                  setProvinciaIdSeleccionada(selected?.value || '');
                  setProvinciaSeleccionada(selected?.label || '');
                }}
                options={provinciasOptions}
                placeholder="Seleccione..."
                maxMenuHeight={
                  deviceType === 'mobile'
                    ? 150
                    : deviceType === 'tablet'
                    ? 180
                    : 200
                }
              />

              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-700 text-sm">
                  Departamento
                </label>
                <input
                  type="text"
                  value={departamentoInput}
                  onChange={(e) => setDepartamentoInput(e.target.value)}
                  placeholder="Ej. Capital, Goya, San Martín..."
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={agregarDepartamento}
                  disabled={
                    !provinciaIdSeleccionada || !departamentoInput.trim()
                  }
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition shadow ${
                    !provinciaIdSeleccionada || !departamentoInput.trim()
                      ? 'bg-gray-300 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  ➕ Agregar Departamento
                </button>
              </div>
            </div>

            {mensajeFeedback && (
              <p
                className={`text-sm font-medium text-center ${
                  mensajeFeedback.includes('✅')
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {mensajeFeedback}
              </p>
            )}
          </div>

          {/* Listado */}
          {deviceType === 'mobile' ? (
            <div className="space-y-4">
              {paginatedRegistros.length === 0 ? (
                <p className="text-center text-gray-500 py-6">
                  Sin datos disponibles
                </p>
              ) : (
                paginatedRegistros.map((r) => (
                  <div
                    key={r.id_departamento ?? r.id}
                    className="bg-white p-4 rounded-xl shadow border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1 text-sm text-gray-700">
                        <p className="font-semibold text-gray-800">
                          {r.provincia}
                        </p>
                        <p>{r.departamento}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            eliminarDepartamento(r.id_departamento ?? r.id)
                          }
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200 shadow-xl">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Provincia
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRegistros.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center text-gray-500 py-6"
                      >
                        Sin datos disponibles
                      </td>
                    </tr>
                  ) : (
                    paginatedRegistros.map((r) => (
                      <tr
                        key={r.id_departamento ?? r.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3">{r.provincia}</td>
                        <td className="px-4 py-3">{r.departamento}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() =>
                                eliminarDepartamento(r.id_departamento ?? r.id)
                              }
                              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <Paginacion
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Modal edición */}
        {editModalOpen && (
          <Modal
            title="Editar Departamento"
            onClose={() => {
              if (!savingEdit) setEditModalOpen(false);
            }}
          >
            <div className="space-y-4">
              {/* Provincia: mostrada pero deshabilitada */}
              <SelectField
                label="Provincia"
                value={
                  editing.id_provincia
                    ? {
                        value: editing.id_provincia,
                        label: editing.provinciaLabel,
                      }
                    : null
                }
                onChange={() => {}}
                options={provinciasOptions}
                placeholder="Seleccione..."
                maxMenuHeight={200}
                isDisabled={true}
              />

              {/* Departamento (editable) */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-700 text-sm">
                  Departamento
                </label>
                <input
                  type="text"
                  value={editing.departamento}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, departamento: e.target.value }))
                  }
                  placeholder="Ej. Capital, Goya, San Martín..."
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
                />
              </div>

              {editError && (
                <div className="text-sm text-red-600">{editError}</div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={savingEdit}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };
}

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

/* ------------------------------------------------------------------ */
/*  SelectField (igual que TropaForm / DecomisoPage)                  */
/* ------------------------------------------------------------------ */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className = '',
}) {
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
    <div className={`flex flex-col ${className}`}>
      <label className="mb-2 font-semibold text-gray-700 text-sm">
        {label}
      </label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        required={required}
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

/* ------------------------------------------------------------------ */
/*  InputField (igual que TropaForm)                                  */
/* ------------------------------------------------------------------ */
const InputField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  className = '',
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-2 font-semibold text-gray-700 text-sm">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Roles y estados                                                   */
/* ------------------------------------------------------------------ */
const roles = [
  { id_rol: 2, nombre: 'Supervisor' },
  { id_rol: 3, nombre: 'Usuario' },
];
const estados = ['Activo', 'Inactivo'];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
const AgregarUsuarioPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
    estado: 'Activo',
    id_rol: '',
    id_planta: '',
    n_telefono: '',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  /* ---------- Paginación ---------- */
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = window.innerWidth < 768 ? 2 : 4; // 2 móvil / 4 desktop

  useEffect(() => {
    Promise.all([fetchUsuarios(), fetchPlantas()])
      .catch(() => setError('Error al cargar datos iniciales'))
      .finally(() => setLoading(false));
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar los usuarios');
    }
  };

  const fetchPlantas = async () => {
    try {
      const res = await fetch('/api/plantas');
      const data = await res.json();
      setPlantas(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar las plantas');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    const url = editandoId ? `/api/usuarios/${editandoId}` : '/api/usuarios';
    const method = editandoId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al guardar usuario');
      setMensaje(editandoId ? 'Usuario modificado ✅' : 'Usuario creado ✅');
      setForm({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        password: '',
        estado: 'Activo',
        id_rol: '',
        id_planta: '',
        n_telefono: '',
      });
      setEditandoId(null);
      setPaginaActual(1);
      await fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (u) => {
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      dni: u.dni,
      email: u.email,
      password: '',
      estado: u.estado,
      id_rol: u.id_rol,
      id_planta: parseInt(u.id_planta, 10),
      n_telefono: u.n_telefono || '',
    });
    setEditandoId(u.id_usuario);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setPaginaActual(1);
      await fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ---------- Filtro + paginación ---------- */
  const usuariosFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.dni.toString().includes(texto) ||
        u.nombre.toLowerCase().includes(texto) ||
        u.apellido.toLowerCase().includes(texto)
    );
  }, [usuarios, filtro]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const visibles = usuariosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  /* ---------- Navegación ---------- */
  const irPagina = (n) =>
    setPaginaActual(Math.min(Math.max(n, 1), totalPaginas));
  const paginaAnterior = () => irPagina(paginaActual - 1);
  const paginaSiguiente = () => irPagina(paginaActual + 1);

  /* ---------- Paginación (igual a TropaForm / DecomisoPage) ---------- */
  const renderPaginacion = () => {
    if (totalPaginas <= 1) return null;

    return (
      <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
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
              onClick={() => setPaginaActual(page)}
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
              onClick={() => setPaginaActual(totalPaginas)}
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
          onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
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
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando datos...
      </div>
    );

  /* ---------- Opciones para react-select ---------- */
  const plantaOptions = plantas
    .filter((p) => typeof p.id_planta !== 'undefined' && p.nombre)
    .map((p) => ({ value: String(p.id_planta), label: p.nombre }));

  const rolOptions = roles.map((r) => ({ value: r.id_rol, label: r.nombre }));
  const estadoOptions = estados.map((e) => ({ value: e, label: e }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
          {editandoId ? 'Modificar Usuario' : 'Agregar Usuario'}
        </h1>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {/* Fila 1 */}
            <InputField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <InputField
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
            <InputField
              label="DNI"
              name="dni"
              type="number"
              value={form.dni}
              onChange={handleChange}
              required
            />

            {/* Fila 2 */}
            <InputField
              label="Teléfono"
              name="n_telefono"
              type="tel"
              value={form.n_telefono}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <InputField
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                editandoId ? 'Dejar vacío para no cambiar' : 'Contraseña'
              }
            />

            {/* Fila 3 */}
            <SelectField
              label="Planta"
              value={
                plantaOptions.find((o) => o.value === String(form.id_planta)) ||
                null
              }
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  id_planta: selected ? selected.value : '',
                }))
              }
              options={plantaOptions}
              placeholder="-- Seleccionar Planta --"
              required
            />
            <SelectField
              label="Rol"
              value={rolOptions.find((o) => o.value === form.id_rol) || null}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  id_rol: selected ? selected.value : '',
                }))
              }
              options={rolOptions}
              placeholder="-- Seleccionar Rol --"
              required
            />
            <SelectField
              label="Estado"
              value={estadoOptions.find((o) => o.value === form.estado) || null}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  estado: selected ? selected.value : 'Activo',
                }))
              }
              options={estadoOptions}
              placeholder="-- Seleccionar Estado --"
            />

            {/* Botón */}
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow"
              >
                {editandoId ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </form>

          {mensaje && (
            <div className="mt-4 flex items-center gap-2 text-green-700">
              <span className="text-lg">✅</span>
              <span>{mensaje}</span>
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-700">
              <span className="text-lg">❌</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Listado + Paginación */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Usuarios Registrados
          </h2>
          <InputField
            label="Buscar por DNI, nombre o apellido"
            name="filtro"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Escriba para filtrar..."
          />

          <div className="mt-4 rounded-xl ring-1 ring-gray-200">
            {visibles.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {visibles.map((u) => (
                  <li
                    key={u.id_usuario}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-semibold">
                          {u.nombre} {u.apellido}
                        </span>{' '}
                        — DNI: {u.dni}
                      </p>
                      <p>
                        {u.email} — Tel: {u.n_telefono} — Rol:{' '}
                        {u.id_rol === 2 ? 'Supervisor' : 'Usuario'}
                      </p>
                      <p>
                        Planta: {u.planta_nombre || `ID ${u.id_planta}`} —
                        Estado:{' '}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.estado === true || u.estado === 'Activo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.estado === true || u.estado === 'Activo'
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>{' '}
                        — Creado: {new Date(u.creado_en).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-0 flex gap-2">
                      <button
                        onClick={() => handleEditar(u)}
                        className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(u.id_usuario)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No se encontraron usuarios.
              </p>
            )}
          </div>

          {/* ---------- Paginación (igual a TropaForm / DecomisoPage) ---------- */}
          {renderPaginacion()}
        </div>
      </div>
    </div>
  );
};

export default AgregarUsuarioPage;

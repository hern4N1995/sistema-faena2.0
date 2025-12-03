import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from 'src/services/api';

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxMenuHeight = 200,
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
      transition: 'all 50ms ease',
      '&:hover': { borderColor: '#96f1b7' },
      '&:focus-within': { borderColor: '#22c55e' },
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
    placeholder: (base) => ({ ...base, fontSize: '14px', color: '#6b7280' }),
    indicatorsContainer: (base) => ({ ...base, height: '48px' }),
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
        maxMenuHeight={maxMenuHeight}
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

const estados = ['Activo', 'Inactivo'];

const VeterinariosPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    dni: '',
    email: '',
    n_telefono: '',
    estado: 'Activo',
    id_planta: '',
  });

  const [esMovil, setEsMovil] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [veterinarios, setVeterinarios] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchVeterinarios(), fetchPlantas()])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchVeterinarios = async () => {
    try {
      const res = await api.get('/veterinarios', {
        headers: { ...getAuthHeaders() },
        timeout: 10000,
      });
      const data = res?.data ?? [];
      setVeterinarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchVeterinarios:', err);
      setError('No se pudieron cargar los veterinarios');
      setVeterinarios([]);
    }
  };

  const fetchPlantas = async () => {
    try {
      const res = await api.get('/plantas', {
        headers: { ...getAuthHeaders() },
        timeout: 10000,
      });
      const data = res?.data ?? [];
      setPlantas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchPlantas:', err);
      setError('No se pudieron cargar las plantas');
      setPlantas([]);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () =>
    setForm({
      nombre: '',
      apellido: '',
      matricula: '',
      dni: '',
      email: '',
      n_telefono: '',
      estado: 'Activo',
      id_planta: '',
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.matricula.trim() ||
      !String(form.dni).trim()
    ) {
      setError('Completar nombre, apellido, matrícula y DNI es obligatorio');
      return;
    }

    const url = editandoId ? `/veterinarios/${editandoId}` : '/veterinarios';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      let res;
      if (editandoId) {
        res = await api.put(`/veterinarios/${editandoId}`, form, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          timeout: 10000,
        });
      } else {
        res = await api.post('/veterinarios', form, {
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          timeout: 10000,
        });
      }
      if (!(res && res.status >= 200 && res.status < 300)) {
        throw new Error('Error al guardar veterinario');
      }

      setMensaje(editandoId ? 'Veterinario modificado' : 'Veterinario creado');
      resetForm();
      setEditandoId(null);
      await fetchVeterinarios();
    } catch (err) {
      console.error('handleSubmit:', err);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Error al guardar veterinario';
      setError(msg);
    }
  };

  const handleEditar = (v) => {
    setForm({
      nombre: v.nombre,
      apellido: v.apellido,
      matricula: v.matricula,
      dni: v.dni || '',
      email: v.email || '',
      n_telefono: v.n_telefono || '',
      estado: v.estado || 'Activo',
      id_planta: v.id_planta || '',
    });
    setEditandoId(v.id_veterinario || v.id);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este veterinario?'))
      return;
    try {
      const res = await api.delete(`/veterinarios/${id}`, {
        headers: { ...getAuthHeaders() },
        timeout: 10000,
      });
      if (!(res && res.status >= 200 && res.status < 300)) {
        throw new Error('Error al eliminar veterinario');
      }
      setMensaje('Veterinario eliminado');
      await fetchVeterinarios();
    } catch (err) {
      console.error('handleEliminar:', err);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Error al eliminar veterinario';
      setError(msg);
    }
  };

  const veterinariosFiltrados = veterinarios.filter((v) => {
    const texto = filtro.toLowerCase();
    return (
      String(v.matricula || '')
        .toLowerCase()
        .includes(texto) ||
      (v.nombre || '').toLowerCase().includes(texto) ||
      (v.apellido || '').toLowerCase().includes(texto) ||
      String(v.dni || '')
        .toLowerCase()
        .includes(texto)
    );
  });

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">Cargando datos...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 px-2 sm:px-4 sm:py-8 py-3">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6">
        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-6 space-y-2 sm:space-y-4">
          <h2 className="text-lg sm:text-3xl font-extrabold text-center text-gray-800 drop-shadow pt-1 mb-1 sm:pt-2 sm:mb-2">
            {editandoId ? '👩‍⚕️ Modificar Veterinario' : '👩‍⚕️ Agregar Veterinario'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4"
          >
            <div className="flex flex-col">
              <label className="mb-1 sm:mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Nombre
              </label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Nombre"
                className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 sm:mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Apellido
              </label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                placeholder="Apellido"
                className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 sm:mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Matrícula
              </label>
              <input
                name="matricula"
                value={form.matricula}
                onChange={handleChange}
                required
                placeholder="Matrícula"
                className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 sm:mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                DNI
              </label>
              <input
                name="dni"
                value={form.dni}
                onChange={handleChange}
                required
                placeholder="DNI"
                className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 sm:mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 sm:mb-2 font-semibold text-gray-700 text-xs sm:text-sm">
                Teléfono
              </label>
              <input
                name="n_telefono"
                value={form.n_telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
              />
            </div>

            <SelectField
              label="Planta"
              value={
                plantas.find(
                  (p) => String(p.id_planta ?? p.id) === String(form.id_planta)
                )
                  ? {
                      value: String(form.id_planta),
                      label: plantas.find(
                        (p) =>
                          String(p.id_planta ?? p.id) === String(form.id_planta)
                      )?.nombre,
                    }
                  : null
              }
              onChange={(s) =>
                setForm((prev) => ({ ...prev, id_planta: s?.value || '' }))
              }
              options={plantas.map((p) => ({
                value: String(p.id_planta ?? p.id),
                label: p.nombre,
              }))}
              maxMenuHeight={esMovil ? 48 * 3 : 48 * 6}
              placeholder="Seleccionar planta"
            />

            <SelectField
              label="Estado"
              value={{ value: form.estado, label: form.estado }}
              onChange={(s) =>
                setForm((prev) => ({ ...prev, estado: s?.value || '' }))
              }
              options={estados.map((e) => ({ value: e, label: e }))}
              maxMenuHeight={esMovil ? 48 * 3 : 48 * 6}
              placeholder="Seleccionar estado"
            />

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
              >
                {editandoId ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </form>

          {mensaje && <p className="text-green-600">{mensaje}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>

        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-6 space-y-2 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">
            Veterinarios Registrados
          </h3>
          <input
            type="text"
            placeholder="Buscar por matrícula, nombre, apellido o DNI"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="mb-2 sm:mb-4 w-full border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
          />

          <div className="space-y-2 sm:space-y-4">
            {veterinariosFiltrados.length > 0 ? (
              veterinariosFiltrados.map((v) => (
                <div
                  key={v.id_veterinario || v.id}
                  className="bg-white p-2 sm:p-4 rounded-xl shadow border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-700">
                      <p className="font-semibold text-gray-800 text-xs sm:text-base">
                        {v.nombre} {v.apellido}
                      </p>
                      <p className="truncate">
                        Matrícula: {v.matricula} — DNI: {v.dni || '-'}
                      </p>
                      <p className="truncate">
                        Email: {v.email || '-'} — Tel: {v.n_telefono || '-'}
                      </p>
                      <p className="truncate">
                        Planta:{' '}
                        {v.planta_nombre ||
                          `ID ${v.id_planta || v.idPlanta || ''}`}{' '}
                        — Estado: {v.estado || '-'}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEditar(v)}
                        className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-yellow-600 text-white text-xs sm:text-sm hover:bg-yellow-700 transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(v.id_veterinario || v.id)}
                        className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-red-600 text-white text-xs sm:text-sm hover:bg-red-700 transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No se encontraron veterinarios.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinariosPage;

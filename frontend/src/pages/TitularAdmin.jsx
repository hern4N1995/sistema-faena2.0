import React, { useState, useEffect } from 'react';
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
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = esMovil ? 4 : 6;

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProvincias, resTitulares] = await Promise.all([
          await api.get('/provincias'),
          await api.get('/titulares-faena'),
        ]);
        setProvinciasDB(await resProvincias.json());
        setTitulares(await resTitulares.json());
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
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
        setTitulares((prev) =>
          Array.isArray(prev) ? [...prev, data] : [data]
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

  const iniciarEdicion = (t) => {
    setEditandoId(t.id);
    setEditado({ ...t });
  };

  /* ---------- Guardar edición de titular ---------- */
  const guardarEdicion = async () => {
    if (!editandoId) return;

    try {
      const res = await api.put(`/titulares-faena/${editandoId}`, editado, {
        timeout: 10000,
      });
      const updated = res?.data ?? editado;

      // actualizar lista local (reemplaza el elemento por el actualizado)
      setTitulares((prev) =>
        Array.isArray(prev)
          ? prev.map((t) =>
              String(t.id) === String(editandoId) ? { ...t, ...updated } : t
            )
          : prev
      );

      setEditandoId(null);
      setEditado({});
    } catch (error) {
      console.error('Error al guardar edición:', error);
      // openErrorModal('No se pudo guardar', error?.response?.data?.message || error.message);
    }
  };

  /* ---------- Eliminar titular ---------- */
  const eliminarTitular = async (id) => {
    if (!window.confirm('¿Eliminar este titular?')) return;

    try {
      const res = await api.delete(`/titulares-faena/${id}`, {
        timeout: 10000,
      });
      const status = res?.status ?? 0;

      if (status >= 200 && status < 300) {
        setTitulares((prev) =>
          Array.isArray(prev)
            ? prev.filter((t) => String(t.id) !== String(id))
            : []
        );
        setPaginaActual(1);
      } else {
        const data = res?.data ?? {};
        console.error('Error al eliminar titular:', data);
        // setMensajeFeedback(`❌ ${data?.message || data?.error || 'Error al eliminar.'}`);
      }
    } catch (error) {
      console.error('Error al eliminar titular:', error);
      // setMensajeFeedback(`❌ ${error?.response?.data?.message || error.message || 'Error de conexión.'}`);
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
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

            <div className="flex items-end">
              <button
                onClick={agregarTitular}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition text-sm font-semibold shadow"
              >
                ➕ Agregar
              </button>
            </div>
          </div>
        </div>

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
                    <td className="px-4 py-3">
                      {editandoId === t.id ? (
                        <input
                          value={editado.nombre}
                          onChange={(e) =>
                            setEditado({ ...editado, nombre: e.target.value })
                          }
                          className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
                        />
                      ) : (
                        t.nombre
                      )}
                    </td>
                    <td className="px-4 py-3">{t.provincia}</td>
                    <td className="px-4 py-3">{t.localidad}</td>
                    <td className="px-4 py-3">{t.direccion}</td>
                    <td className="px-4 py-3">{t.documento}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {editandoId === t.id ? (
                          <button
                            onClick={guardarEdicion}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                          >
                            💾 Guardar
                          </button>
                        ) : (
                          <button
                            onClick={() => iniciarEdicion(t)}
                            className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                          >
                            ✏️ Editar
                          </button>
                        )}
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

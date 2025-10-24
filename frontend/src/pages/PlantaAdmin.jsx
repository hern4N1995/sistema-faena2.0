import React, { useState, useEffect } from 'react';
import Select from 'react-select';

/* ------------------------------------------------------------------ */
/*  SelectField con estilos visuales unificados                      */
/* ------------------------------------------------------------------ */
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
        maxMenuHeight={maxMenuHeight}
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

export default function PlantaAdmin() {
  const [plantas, setPlantas] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [nuevaPlanta, setNuevaPlanta] = useState({
    nombre: '',
    provincia: null,
    direccion: '',
    fecha_habilitacion: '',
    norma_legal: '',
    estado: true,
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const cargarPlantas = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/plantas');
        const data = await res.json();
        setPlantas(data);
      } catch (error) {
        console.error('Error al cargar plantas:', error);
      }
    };
    cargarPlantas();
  }, []);

  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/provincias');
        const data = await res.json();
        setProvincias(data);
      } catch (error) {
        console.error('Error al cargar provincias:', error);
      }
    };
    cargarProvincias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setNuevaPlanta({ ...nuevaPlanta, [name]: val });
  };

  const handleProvinciaChange = (selected) => {
    setNuevaPlanta({ ...nuevaPlanta, provincia: selected });
  };

  const agregarPlanta = async () => {
    if (!nuevaPlanta.nombre.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/plantas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevaPlanta,
          id_provincia: nuevaPlanta.provincia?.value || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlantas([...plantas, data]);
        setNuevaPlanta({
          nombre: '',
          provincia: null,
          direccion: '',
          fecha_habilitacion: '',
          norma_legal: '',
          estado: true,
        });
      }
    } catch (error) {
      console.error('Error al agregar planta:', error);
    }
  };

  const iniciarEdicion = (planta) => {
    setEditandoId(planta.id);
    setEditado({ ...planta });
  };

  const guardarEdicion = async () => {
    const payload = {
      ...editado,
      estado: !!editado.estado,
      id_provincia: editado.provincia?.value || editado.id_provincia,
    };
    try {
      const res = await fetch(
        `http://localhost:3000/api/plantas/${editandoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok && data?.id === editandoId) {
        setPlantas((prev) =>
          prev.map((p) => (p.id === editandoId ? { ...p, ...data } : p))
        );
        setEditandoId(null);
        setEditado({});
      }
    } catch (error) {
      console.error('Error al guardar edición:', error);
    }
  };

  const deshabilitarPlanta = async (id) => {
    if (!window.confirm('¿Está seguro de deshabilitar esta planta?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/plantas/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPlantas((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: false } : p))
        );
      }
    } catch (error) {
      console.error('Error al deshabilitar planta:', error);
    }
  };

  const plantasFiltradas = plantas.filter((p) => {
    const coincideNombre = p.nombre
      ?.toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const coincideProvincia = p.provincia
      ?.toLowerCase()
      .includes(filtroProvincia.toLowerCase());
    const coincideFecha = filtroFecha
      ? p.fecha_habilitacion?.startsWith(filtroFecha)
      : true;
    return coincideNombre && coincideProvincia && coincideFecha;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 drop-shadow pt-2 mb-4">
            🏭 Administración de Plantas
          </h1>

          {/* Formulario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Nombre
              </label>
              <input
                name="nombre"
                value={nuevaPlanta.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
              />
            </div>

            <SelectField
              label="Provincia"
              value={
                nuevaPlanta.provincia
                  ? {
                      value: nuevaPlanta.provincia.value,
                      label: nuevaPlanta.provincia.label,
                    }
                  : null
              }
              onChange={handleProvinciaChange}
              options={provincias.map((p) => ({
                value: p.id,
                label: p.descripcion,
              }))}
              placeholder="Seleccionar provincia"
            />

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Dirección
              </label>
              <input
                name="direccion"
                value={nuevaPlanta.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Fecha Habilitación
              </label>
              <input
                type="date"
                name="fecha_habilitacion"
                value={nuevaPlanta.fecha_habilitacion}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 text-sm">
                Norma Legal
              </label>
              <input
                name="norma_legal"
                value={nuevaPlanta.norma_legal}
                onChange={handleChange}
                placeholder="Norma Legal"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="estado"
                  checked={nuevaPlanta.estado}
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-700">Habilitada</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={agregarPlanta}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
            >
              ➕ Agregar Planta
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="🔍 Filtrar por nombre"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
            />
            <input
              type="text"
              value={filtroProvincia}
              onChange={(e) => setFiltroProvincia(e.target.value)}
              placeholder="🔍 Filtrar por provincia"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
            />
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
            />
          </div>
          {/* Lista de plantas */}
          {esMovil ? (
            <div className="space-y-4">
              {plantasFiltradas.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-50 p-4 rounded-xl shadow border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1 text-sm text-gray-700">
                      <p className="font-semibold text-gray-800">{p.nombre}</p>
                      <p>{p.provincia || '—'}</p>
                      <p>{p.direccion || '—'}</p>
                      <p>Fecha: {p.fecha_habilitacion || '—'}</p>
                      <p>Norma: {p.norma_legal || '—'}</p>
                      <p>
                        Estado:{' '}
                        {p.estado ? '✅ Habilitada' : '❌ Deshabilitada'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      {editandoId === p.id ? (
                        <button
                          onClick={guardarEdicion}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                        >
                          💾
                        </button>
                      ) : (
                        <button
                          onClick={() => iniciarEdicion(p)}
                          className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={() => deshabilitarPlanta(p.id)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                      >
                        🚫
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Provincia
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Norma Legal
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantasFiltradas.map((p) =>
                    editandoId === p.id ? (
                      <tr key={p.id} className="bg-yellow-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editado.nombre || ''}
                            onChange={(e) =>
                              setEditado({ ...editado, nombre: e.target.value })
                            }
                            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editado.id_provincia || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                id_provincia: e.target.value,
                              })
                            }
                            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
                          >
                            <option value="">Seleccionar provincia</option>
                            {provincias.map((prov) => (
                              <option key={prov.id} value={prov.id}>
                                {prov.descripcion}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editado.direccion || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                direccion: e.target.value,
                              })
                            }
                            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            value={editado.fecha_habilitacion || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                fecha_habilitacion: e.target.value,
                              })
                            }
                            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editado.norma_legal || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                norma_legal: e.target.value,
                              })
                            }
                            className="w-full border-2 border-gray-200 rounded-lg px-2 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!editado.estado}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                estado: e.target.checked,
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={guardarEdicion}
                              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                            >
                              💾 Guardar
                            </button>
                            <button
                              onClick={() => setEditandoId(null)}
                              className="px-3 py-2 rounded-lg bg-gray-400 text-white text-sm hover:bg-gray-500 transition"
                            >
                              ❌ Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">{p.nombre}</td>
                        <td className="px-4 py-3">{p.provincia || '—'}</td>
                        <td className="px-4 py-3">{p.direccion || '—'}</td>
                        <td className="px-4 py-3">
                          {p.fecha_habilitacion || '—'}
                        </td>
                        <td className="px-4 py-3">{p.norma_legal || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {p.estado ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => iniciarEdicion(p)}
                              className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => deshabilitarPlanta(p.id)}
                              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                            >
                              🚫 Deshabilitar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function PlantaAdmin() {
  const [plantas, setPlantas] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [nuevaPlanta, setNuevaPlanta] = useState({
    nombre: '',
    id_provincia: '',
    direccion: '',
    fecha_habilitacion: '',
    norma_legal: '',
    estado: true,
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  // Filtros
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

  const agregarPlanta = async () => {
    if (!nuevaPlanta.nombre.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/plantas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPlanta),
      });
      const data = await res.json();
      if (res.ok) {
        setPlantas([...plantas, data]);
        setNuevaPlanta({
          nombre: '',
          id_provincia: '',
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
    const payload = { ...editado, estado: !!editado.estado };
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
      } else {
        console.warn('ID inválido o respuesta inesperada:', data);
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
        <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            🏭 Administrar Plantas
          </h1>

          {/* Formulario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                name="nombre"
                value={nuevaPlanta.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Provincia
              </label>
              <select
                name="id_provincia"
                value={nuevaPlanta.id_provincia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">Seleccionar provincia</option>
                {provincias.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                name="direccion"
                value={nuevaPlanta.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Fecha Habilitación
              </label>
              <input
                type="date"
                name="fecha_habilitacion"
                value={nuevaPlanta.fecha_habilitacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Norma Legal
              </label>
              <input
                name="norma_legal"
                value={nuevaPlanta.norma_legal}
                onChange={handleChange}
                placeholder="Norma Legal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                <span className="text-m">Habilitada</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={agregarPlanta}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <input
              type="text"
              value={filtroProvincia}
              onChange={(e) => setFiltroProvincia(e.target.value)}
              placeholder="🔍 Filtrar por provincia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {/* Lista de plantas */}
          {esMovil ? (
            <div className="space-y-4">
              {plantasFiltradas.map((p) => (
                <div key={p.id} className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-gray-800 text-sm">
                        {p.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {p.provincia || '—'}
                      </p>
                      <p className="text-sm">{p.direccion || '—'}</p>
                      <p className="text-sm">
                        Fecha: {p.fecha_habilitacion || '—'}
                      </p>
                      <p className="text-sm">Norma: {p.norma_legal || '—'}</p>
                      <p className="text-sm">
                        Estado:{' '}
                        {p.estado ? '✅ Habilitada' : '❌ Deshabilitada'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      {editandoId === p.id ? (
                        <button
                          onClick={guardarEdicion}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                          💾
                        </button>
                      ) : (
                        <button
                          onClick={() => iniciarEdicion(p)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={() => deshabilitarPlanta(p.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        🚫
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Provincia
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Fecha Habilitación
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Norma Legal
                    </th>
                    <th className="px-4 py-3 text-center text-m font-semibold">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plantasFiltradas.map((p) =>
                    editandoId === p.id ? (
                      <tr key={p.id} className="bg-yellow-50">
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="text"
                            value={editado.nombre || ''}
                            onChange={(e) =>
                              setEditado({ ...editado, nombre: e.target.value })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <select
                            value={editado.id_provincia || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                id_provincia: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Seleccionar provincia</option>
                            {provincias.map((prov) => (
                              <option key={prov.id} value={prov.id}>
                                {prov.descripcion}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="text"
                            value={editado.direccion || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                direccion: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="date"
                            value={editado.fecha_habilitacion || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                fecha_habilitacion: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="text"
                            value={editado.norma_legal || ''}
                            onChange={(e) =>
                              setEditado({
                                ...editado,
                                norma_legal: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
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
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                            >
                              💾 Guardar
                            </button>
                            <button
                              onClick={() => setEditandoId(null)}
                              className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition"
                            >
                              ❌ Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm">
                          {p.provincia || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {p.direccion || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {p.fecha_habilitacion || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {p.norma_legal || '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {p.estado ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => iniciarEdicion(p)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => deshabilitarPlanta(p.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
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

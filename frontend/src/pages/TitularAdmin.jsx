import React, { useState, useEffect } from 'react';

export default function TitularAdmin() {
  const [titulares, setTitulares] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [nuevoTitular, setNuevoTitular] = useState({
    nombre: '',
    provincia: '',
    localidad: '',
    direccion: '',
    documento: '',
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProvincias, resTitulares] = await Promise.all([
          fetch('http://localhost:3000/api/provincias'),
          fetch('http://localhost:3000/api/titulares-faena'),
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
      const res = await fetch('http://localhost:3000/api/titulares-faena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoTitular.nombre,
          id_provincia: parseInt(nuevoTitular.provincia, 10),
          localidad: nuevoTitular.localidad,
          direccion: nuevoTitular.direccion,
          documento: nuevoTitular.documento,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitulares([...titulares, data]);
        setNuevoTitular({
          nombre: '',
          provincia: '',
          localidad: '',
          direccion: '',
          documento: '',
        });
      }
    } catch (error) {
      console.error('Error al agregar titular:', error);
    }
  };

  const iniciarEdicion = (titular) => {
    setEditandoId(titular.id);
    setEditado({ ...titular });
  };

  const guardarEdicion = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/titulares-faena/${editandoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editado),
        }
      );
      if (res.ok) {
        setTitulares(titulares.map((t) => (t.id === editandoId ? editado : t)));
        setEditandoId(null);
        setEditado({});
      }
    } catch (error) {
      console.error('Error al modificar titular:', error);
    }
  };

  const eliminarTitular = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este titular?')) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/titulares-faena/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (res.ok) {
        setTitulares(titulares.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar titular:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 leading-tight tracking-tight">
            🧾 Administración de Titulares de Faena
          </h1>

          {/* Formulario adaptativo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="w-full">
              <label className="block text-m font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                name="nombre"
                value={nuevoTitular.nombre}
                onChange={handleChange}
                placeholder="Nombre / Razón Social"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div className="w-full">
              <label className="block text-m font-medium text-gray-700 mb-1">
                Provincia *
              </label>
              <select
                name="provincia"
                value={nuevoTitular.provincia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">-- Seleccioná --</option>
                {provinciasDB.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-m font-medium text-gray-700 mb-1">
                Localidad *
              </label>
              <input
                name="localidad"
                value={nuevoTitular.localidad}
                onChange={handleChange}
                placeholder="Localidad"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div className="w-full">
              <label className="block text-m font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                name="direccion"
                value={nuevoTitular.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div className="w-full">
              <label className="block text-m font-medium text-gray-700 mb-1">
                DNI/CUIT
              </label>
              <input
                name="documento"
                value={nuevoTitular.documento}
                onChange={handleChange}
                placeholder="DNI o CUIT"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
            <div className="w-full flex items-end">
              <button
                onClick={agregarTitular}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
              >
                ➕ Agregar
              </button>
            </div>
          </div>

          {/* Lista de titulares - Vista adaptable */}
          {esMovil ? (
            // Vista móvil: Tarjetas
            <div className="space-y-4">
              {titulares.map((t) => (
                <div key={t.id} className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-gray-800">{t.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {t.provincia} - {t.localidad}
                      </p>
                      <p className="text-sm">{t.direccion}</p>
                      <p className="text-sm">DNI/CUIT: {t.documento}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      {editandoId === t.id ? (
                        <button
                          onClick={guardarEdicion}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                        >
                          💾
                        </button>
                      ) : (
                        <button
                          onClick={() => iniciarEdicion(t)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={() => eliminarTitular(t.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista desktop/tablet: Tabla
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
                      Localidad
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      DNI/CUIT
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {titulares.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">
                        {editandoId === t.id ? (
                          <input
                            value={editado.nombre}
                            onChange={(e) =>
                              setEditado({ ...editado, nombre: e.target.value })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          t.nombre
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{t.provincia}</td>
                      <td className="px-4 py-3 text-sm">{t.localidad}</td>
                      <td className="px-4 py-3 text-sm">{t.direccion}</td>
                      <td className="px-4 py-3 text-sm">{t.documento}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          {editandoId === t.id ? (
                            <button
                              onClick={guardarEdicion}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition"
                            >
                              💾 Guardar
                            </button>
                          ) : (
                            <button
                              onClick={() => iniciarEdicion(t)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition"
                            >
                              ✏️ Editar
                            </button>
                          )}
                          <button
                            onClick={() => eliminarTitular(t.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
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
        </div>
      </div>
    </div>
  );
}

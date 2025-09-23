import { useState, useEffect } from 'react';

export default function DepartamentoAdmin() {
  const [registros, setRegistros] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [provinciaIdSeleccionada, setProvinciaIdSeleccionada] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
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
        const [resDeptos, resProvincias] = await Promise.all([
          fetch('http://localhost:3000/api/departamentos'),
          fetch('http://localhost:3000/api/provincias'),
        ]);
        const departamentos = await resDeptos.json();
        const provincias = await resProvincias.json();
        setRegistros(departamentos.filter((d) => d.activo !== false));
        setProvinciasDB(provincias);
      } catch (error) {
        setMensajeFeedback('❌ Error al conectar con el servidor.');
        setTimeout(() => setMensajeFeedback(''), 4000);
      }
    };
    cargarDatos();
  }, []);

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

    const yaExiste = registros.some(
      (r) =>
        r.provincia?.toLowerCase() === provinciaSeleccionada.toLowerCase() &&
        r.departamento?.toLowerCase() === nombre.toLowerCase()
    );
    if (yaExiste) {
      setMensajeFeedback('❌ El departamento ya existe en esa provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/departamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_departamento: nombre,
          id_provincia: parseInt(provinciaIdSeleccionada, 10),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegistros((prev) => [...prev, data]);
        setProvinciaSeleccionada('');
        setProvinciaIdSeleccionada('');
        setDepartamentoInput('');
        setMensajeFeedback('✅ Departamento agregado correctamente.');
      } else {
        setMensajeFeedback(`❌ ${data.error}`);
      }
    } catch (error) {
      setMensajeFeedback('❌ Error de conexión con el servidor.');
    }
    setTimeout(() => setMensajeFeedback(''), 4000);
  };

  const modificarDepartamento = async (id, nuevoNombre) => {
    if (!nuevoNombre.trim()) return;
    try {
      const res = await fetch(`http://localhost:3000/api/departamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_departamento: nuevoNombre.trim() }),
      });
      if (res.ok) {
        setRegistros((prev) =>
          prev.map((r) =>
            r.id_departamento === id ? { ...r, departamento: nuevoNombre } : r
          )
        );
        setMensajeFeedback('✅ Departamento modificado.');
      }
    } catch (error) {
      console.error('Error al modificar:', error);
    }
  };

  const eliminarDepartamento = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este departamento?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/departamentos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRegistros((prev) => prev.filter((r) => r.id_departamento !== id));
        setMensajeFeedback('✅ Departamento eliminado.');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            🗂️ Administración de Departamentos
          </h1>

          {/* Formulario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Provincia *
              </label>
              <select
                value={provinciaIdSeleccionada}
                onChange={(e) => {
                  const id = e.target.value;
                  setProvinciaIdSeleccionada(id);
                  const prov = provinciasDB.find(
                    (p) => p?.id?.toString() === id
                  );
                  setProvinciaSeleccionada(prov ? prov.descripcion : '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="">-- Seleccioná --</option>
                {provinciasDB
                  .filter((p) => p && p.id != null)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.descripcion}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-m font-medium text-gray-700 mb-1">
                Departamento *
              </label>
              <input
                type="text"
                value={departamentoInput}
                onChange={(e) => setDepartamentoInput(e.target.value)}
                placeholder="Nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={agregarDepartamento}
                disabled={!provinciaIdSeleccionada || !departamentoInput.trim()}
                className={`w-full px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
                  !provinciaIdSeleccionada || !departamentoInput.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                ➕ Agregar
              </button>
            </div>
          </div>

          {mensajeFeedback && (
            <p
              className={`text-sm font-medium text-center ${
                mensajeFeedback.includes('✅')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {mensajeFeedback}
            </p>
          )}

          {/* Lista de departamentos - Vista adaptable */}
          {esMovil ? (
            <div className="space-y-4">
              {registros.length === 0 ? (
                <p className="text-center text-gray-500">
                  Sin datos disponibles
                </p>
              ) : (
                registros.map((r) => (
                  <div
                    key={r.id_departamento}
                    className="bg-gray-50 p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-gray-800">
                          ID: {r.id_departamento}
                        </p>
                        <p className="text-sm text-gray-600">{r.provincia}</p>
                        <p className="text-sm">{r.departamento}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => {
                            const nuevo = prompt(
                              'Nuevo nombre:',
                              r.departamento
                            );
                            if (nuevo?.trim())
                              modificarDepartamento(r.id_departamento, nuevo);
                          }}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            eliminarDepartamento(r.id_departamento)
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
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
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Provincia
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registros.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-gray-500 py-4"
                      >
                        Sin datos disponibles
                      </td>
                    </tr>
                  ) : (
                    registros.map((r) => (
                      <tr
                        key={r.id_departamento}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">
                          {r.id_departamento}
                        </td>
                        <td className="px-4 py-3 text-sm">{r.provincia}</td>
                        <td className="px-4 py-3 text-sm">{r.departamento}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                const nuevo = prompt(
                                  'Nuevo nombre:',
                                  r.departamento
                                );
                                if (nuevo?.trim())
                                  modificarDepartamento(
                                    r.id_departamento,
                                    nuevo
                                  );
                              }}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() =>
                                eliminarDepartamento(r.id_departamento)
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
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
        </div>
      </div>
    </div>
  );
}

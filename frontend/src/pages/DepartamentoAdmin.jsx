import { useState, useEffect } from 'react';

export default function DepartamentoAdmin() {
  const [registros, setRegistros] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [provinciaIdSeleccionada, setProvinciaIdSeleccionada] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState('');

  // Cargar provincias y departamentos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resDeptos, resProvincias] = await Promise.all([
          fetch('http://localhost:3000/api/departamentos'),
          fetch('http://localhost:3000/api/provincias'),
        ]);
        const departamentos = await resDeptos.json();
        const provincias = await resProvincias.json();
        console.log('Provincias recibidas del backend:', provincias);
        setRegistros(departamentos.filter((d) => d.activo !== false)); // solo activos
        setProvinciasDB(provincias);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMensajeFeedback('❌ Error al conectar con el servidor.');
        setTimeout(() => setMensajeFeedback(''), 4000);
      }
    };
    cargarDatos();
  }, []);

  // Alta de departamento
  const agregarDepartamento = async () => {
    const nombre = departamentoInput.trim();
    if (
      !provinciaIdSeleccionada ||
      isNaN(parseInt(provinciaIdSeleccionada, 10)) ||
      !nombre
    ) {
      setMensajeFeedback('❌ Completá ambos campos correctamente.');
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
      console.log('Payload:', {
        nombre_departamento: nombre,
        id_provincia: parseInt(provinciaIdSeleccionada, 10),
      });

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
      console.error('Error al agregar departamento:', error);
      setMensajeFeedback('❌ Error de conexión con el servidor.');
    }
    setTimeout(() => setMensajeFeedback(''), 4000);
  };

  // Modificar departamento
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

  // Eliminar departamento
  const eliminarDepartamento = async (id) => {
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
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-2">Administrar Departamentos</h1>

      {/* Formulario */}
      <div className="space-y-4">
        {/* Selector de provincia */}
        <div>
          <label htmlFor="provincia" className="block mb-1 font-medium">
            Seleccioná una provincia
          </label>
          <select
            id="provincia"
            value={provinciaIdSeleccionada}
            onChange={(e) => {
              const id = e.target.value;
              setProvinciaIdSeleccionada(id);
              const provObj = provinciasDB.find(
                (p) => p?.id?.toString() === id
              );
              setProvinciaSeleccionada(provObj ? provObj.descripcion : '');
            }}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Nombre del departamento */}
        <input
          type="text"
          value={departamentoInput}
          onChange={(e) => setDepartamentoInput(e.target.value)}
          placeholder="Nombre del departamento..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Botón agregar */}
        <button
          onClick={agregarDepartamento}
          disabled={!provinciaIdSeleccionada || !departamentoInput.trim()}
          className={`px-4 py-2 rounded text-white ${
            !provinciaIdSeleccionada || !departamentoInput.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Agregar
        </button>

        {/* Feedback */}
        {mensajeFeedback && (
          <p
            className={`text-sm ${
              mensajeFeedback.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensajeFeedback}
          </p>
        )}
      </div>

      {/* Tabla */}
      <table className="w-full border mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">ID</th>
            <th className="border px-3 py-2 text-left">Provincia</th>
            <th className="border px-3 py-2 text-left">Departamento</th>
            <th className="border px-3 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 py-4">
                No hay departamentos registrados.
              </td>
            </tr>
          ) : (
            registros.map((r) => (
              <tr key={r.id_departamento} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{r.id_departamento}</td>
                <td className="border px-3 py-1">{r.provincia}</td>
                <td className="border px-3 py-1">{r.departamento}</td>
                <td className="border px-3 py-1 space-x-2">
                  <button
                    onClick={() => {
                      const nuevoNombre = prompt(
                        'Nuevo nombre para el departamento:',
                        r.departamento
                      );
                      if (nuevoNombre && nuevoNombre.trim() !== '') {
                        modificarDepartamento(r.id_departamento, nuevoNombre);
                      }
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Seguro que querés eliminar el departamento "${r.departamento}"?`
                        )
                      ) {
                        eliminarDepartamento(r.id_departamento);
                      }
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

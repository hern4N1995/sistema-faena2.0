import { useState, useEffect, useRef } from 'react';

export default function DepartamentoAdmin() {
  const departamentosPorProvincia = {
    Corrientes: [
      'Bella Vista',
      'Berón de Astrada',
      'Capital',
      'Concepción',
      'Curuzú Cuatiá',
      'Empedrado',
      'Esquina',
      'General Alvear',
      'General Paz',
      'Goya',
      'Itatí',
      'Ituzaingó',
      'Lavalle',
      'Mburucuyá',
      'Mercedes',
      'Monte Caseros',
      'Paso de los Libres',
      'Saladas',
      'San Cosme',
      'San Luis del Palmar',
      'San Martín',
      'San Miguel',
      'San Roque',
      'Santo Tomé',
      'Sauce',
    ],
    // Podés agregar más provincias acá
  };

  const provincias = Object.keys(departamentosPorProvincia);

  const [registros, setRegistros] = useState([]);
  useEffect(() => {
    const cargarDepartamentosDesdeDB = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/departamentos');
        const data = await res.json();
        setRegistros(data);
      } catch (error) {
        console.error('Error al cargar departamentos desde la base:', error);
        setMensajeFeedback('❌ Error al conectar con el servidor.');
        setTimeout(() => setMensajeFeedback(''), 4000);
      }
    };

    cargarDepartamentosDesdeDB();
  }, []);

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [departamentoEditado, setDepartamentoEditado] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const [sugerenciasProvincia, setSugerenciasProvincia] = useState([]);
  const [mostrarSugerenciasProvincia, setMostrarSugerenciasProvincia] =
    useState(false);
  const [mostrarSugerenciasDepartamento, setMostrarSugerenciasDepartamento] =
    useState(false);

  const provinciaRef = useRef(null);
  const departamentoRef = useRef(null);

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (provinciaRef.current && !provinciaRef.current.contains(e.target)) {
        setMostrarSugerenciasProvincia(false);
      }
      if (
        departamentoRef.current &&
        !departamentoRef.current.contains(e.target)
      ) {
        setMostrarSugerenciasDepartamento(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const manejarProvincia = (e) => {
    const texto = e.target.value;
    setProvinciaSeleccionada(texto);
    const filtradas = provincias.filter((p) =>
      p.toLowerCase().includes(texto.toLowerCase())
    );
    setSugerenciasProvincia(filtradas);
    setMostrarSugerenciasProvincia(true);
    setDepartamentoSeleccionado('');
    setMensajeFeedback('');
  };

  const seleccionarProvincia = (nombre) => {
    setProvinciaSeleccionada(nombre);
    setSugerenciasProvincia([]);
    setMostrarSugerenciasProvincia(false);
    setDepartamentoSeleccionado('');
    setMensajeFeedback('');
  };

  const manejarDepartamento = (e) => {
    setDepartamentoSeleccionado(e.target.value);
    setMensajeFeedback('');
  };

  const seleccionarDepartamento = (nombre) => {
    setDepartamentoSeleccionado(nombre);
    setMostrarSugerenciasDepartamento(false);
    setMensajeFeedback('');
  };

  const agregarDepartamento = () => {
    if (!provinciaSeleccionada.trim() || !departamentoSeleccionado.trim())
      return;

    const yaExiste = registros.some(
      (r) =>
        r.provincia.toLowerCase() ===
          provinciaSeleccionada.trim().toLowerCase() &&
        r.departamento.toLowerCase() ===
          departamentoSeleccionado.trim().toLowerCase()
    );

    if (yaExiste) {
      setMensajeFeedback(
        '❌ El departamento ya está registrado en esa provincia.'
      );
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }

    const nuevo = {
      provincia: provinciaSeleccionada.trim(),
      departamento: departamentoSeleccionado.trim(),
    };

    setRegistros([...registros, nuevo]);
    setDepartamentoSeleccionado('');
    setMensajeFeedback('✅ Departamento agregado correctamente.');
    setTimeout(() => setMensajeFeedback(''), 4000);
  };

  const modificarDepartamento = async (id) => {
    if (!departamentoEditado.trim()) return;

    const confirmar = window.confirm(
      `¿Estás seguro de que querés modificar el departamento a "${departamentoEditado}"?`
    );
    if (!confirmar) return;

    try {
      await fetch(`http://localhost:3000/api/departamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: departamentoEditado.trim() }),
      });

      const actualizados = registros.map((r) =>
        r.id === id ? { ...r, departamento: departamentoEditado.trim() } : r
      );

      setRegistros(actualizados);
      setEditandoId(null);
      setDepartamentoEditado('');
      setMensajeFeedback('✅ Departamento modificado correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (error) {
      console.error('Error al modificar departamento:', error);
      setMensajeFeedback('❌ Error al modificar departamento.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  const eliminarDepartamento = (id) => {
    setRegistros(registros.filter((r) => r.id !== id));
    setMensajeFeedback('✅ Departamento eliminado correctamente.');
    setTimeout(() => setMensajeFeedback(''), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-2">Administrar Departamentos</h1>

      {/* Provincia */}
      <div className="relative" ref={provinciaRef}>
        <input
          type="text"
          value={provinciaSeleccionada}
          onChange={manejarProvincia}
          onFocus={() => {
            const filtradas = provincias.filter((p) =>
              p.toLowerCase().includes(provinciaSeleccionada.toLowerCase())
            );
            setSugerenciasProvincia(filtradas);
            setMostrarSugerenciasProvincia(true);
          }}
          placeholder="Ingresar provincia..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {mostrarSugerenciasProvincia && sugerenciasProvincia.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
            {sugerenciasProvincia.map((prov, idx) => (
              <li
                key={idx}
                onClick={() => seleccionarProvincia(prov)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {prov}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Departamento */}
      {provinciaSeleccionada && (
        <div
          className="relative flex flex-col gap-2 mt-4"
          ref={departamentoRef}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={departamentoSeleccionado}
              onChange={manejarDepartamento}
              onFocus={() => setMostrarSugerenciasDepartamento(true)}
              placeholder="Ingresar departamento..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={agregarDepartamento}
              className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36]"
            >
              Agregar
            </button>
          </div>

          {mostrarSugerenciasDepartamento && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
              {(departamentosPorProvincia[provinciaSeleccionada] || [])
                .filter((dep) =>
                  dep
                    .toLowerCase()
                    .includes(departamentoSeleccionado.toLowerCase())
                )
                .map((dep, idx) => (
                  <li
                    key={idx}
                    onClick={() => seleccionarDepartamento(dep)}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                  >
                    {dep}
                  </li>
                ))}
            </ul>
          )}

          {mensajeFeedback && (
            <span
              className={`text-sm mt-2 block ${
                mensajeFeedback.includes('✅')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {mensajeFeedback}
            </span>
          )}
        </div>
      )}

      {/* Tabla */}
      <table className="w-full border mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">ID</th>
            <th className="border px-3 py-2 text-left">Provincia</th>
            <th className="border px-3 py-2 text-left">Departamento</th>
            <th className="border px-3 py-2 text-left">Acción</th>
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
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{r.id}</td>
                <td className="border px-3 py-1">{r.provincia}</td>
                <td className="border px-3 py-1">
                  {editandoId === r.id ? (
                    <input
                      value={departamentoEditado}
                      onChange={(e) => setDepartamentoEditado(e.target.value)}
                      className="w-full px-2 py-1 border rounded bg-gray-100"
                    />
                  ) : (
                    r.departamento
                  )}
                </td>
                <td className="border px-3 py-1 space-x-2">
                  {/* Botones de acción */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

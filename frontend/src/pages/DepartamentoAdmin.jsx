import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

/* ------------------------------------------------------------------ */
/*  SelectField estilizado como en AgregarUsuarioPage                 */
/* ------------------------------------------------------------------ */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxMenuHeight = 200,
  required = false,
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
/*  Paginación estilizada como en AgregarUsuarioPage                  */
/* ------------------------------------------------------------------ */
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
export default function DepartamentoAdmin() {
  const [registros, setRegistros] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [provinciaIdSeleccionada, setProvinciaIdSeleccionada] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deviceType, setDeviceType] = useState('desktop');

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

  const provinciasOptions = useMemo(() => {
    return provinciasDB
      .filter((p) => p && p.id != null)
      .map((p) => ({ value: p.id, label: p.descripcion }));
  }, [provinciasDB]);

  const paginatedRegistros = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return registros.slice(start, start + itemsPerPage);
  }, [registros, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(registros.length / itemsPerPage);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Encabezado */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
          🗂️ Administración de Departamentos
        </h1>

        {/* Formulario separado con sombra */}
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
                disabled={!provinciaIdSeleccionada || !departamentoInput.trim()}
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

        {/* Listado y paginación */}
        {deviceType === 'mobile' ? (
          <div className="space-y-4">
            {paginatedRegistros.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                Sin datos disponibles
              </p>
            ) : (
              paginatedRegistros.map((r) => (
                <div
                  key={r.id_departamento}
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
                        onClick={() => {
                          const nuevo = prompt('Nuevo nombre:', r.departamento);
                          if (nuevo?.trim())
                            modificarDepartamento(r.id_departamento, nuevo);
                        }}
                        className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarDepartamento(r.id_departamento)}
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
                    <td colSpan="3" className="text-center text-gray-500 py-6">
                      Sin datos disponibles
                    </td>
                  </tr>
                ) : (
                  paginatedRegistros.map((r) => (
                    <tr
                      key={r.id_departamento}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">{r.provincia}</td>
                      <td className="px-4 py-3">{r.departamento}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              const nuevo = prompt(
                                'Nuevo nombre:',
                                r.departamento
                              );
                              if (nuevo?.trim())
                                modificarDepartamento(r.id_departamento, nuevo);
                            }}
                            className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() =>
                              eliminarDepartamento(r.id_departamento)
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

        {/* Paginación externa */}
        {totalPages > 1 && (
          <Paginacion
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

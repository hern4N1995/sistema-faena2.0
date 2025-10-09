import React, { useState, useEffect, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  InputField (mismo estilo que TropaForm)                           */
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
/*  Provincias hard-codeadas (autocompletado)                         */
/* ------------------------------------------------------------------ */
const todasLasProvincias = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function ProvinciaAdmin() {
  const [provincias, setProvincias] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const inputRef = React.useRef(null);

  /* ---------- Paginación + búsqueda ---------- */
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtro, setFiltro] = useState('');
  const itemsPorPagina =
    window.innerWidth < 768 ? 4 : window.innerWidth < 1024 ? 6 : 8;

  useEffect(() => {
    fetchProvincias();
    const manejarClickFuera = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const fetchProvincias = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/provincias');
      const data = await res.json();
      setProvincias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar provincias:', err);
    }
  };

  const manejarBusqueda = (e) => {
    const texto = e.target.value;
    setNuevaDescripcion(texto);
    const filtradas = todasLasProvincias.filter((prov) =>
      prov.toLowerCase().includes(texto.toLowerCase())
    );
    setSugerencias(filtradas);
    setMostrarSugerencias(true);
    setMensajeFeedback('');
  };

  const seleccionarProvincia = (nombre) => {
    setNuevaDescripcion(nombre);
    setSugerencias([]);
    setMostrarSugerencias(false);
    setMensajeFeedback('');
  };

  const agregarProvincia = async () => {
    if (!nuevaDescripcion.trim()) return;
    const yaExiste = provincias.some(
      (p) =>
        p.descripcion.toLowerCase() === nuevaDescripcion.trim().toLowerCase()
    );
    if (yaExiste) {
      setMensajeFeedback('❌ La provincia ya está registrada.');
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/provincias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: nuevaDescripcion.trim() }),
      });
      const nueva = await res.json();
      setProvincias([...provincias, nueva]);
      setNuevaDescripcion('');
      setSugerencias([]);
      setMostrarSugerencias(false);
      setMensajeFeedback('✅ Provincia agregada correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (err) {
      console.error('Error al agregar provincia:', err);
      setMensajeFeedback('❌ Error al agregar provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  const eliminarProvincia = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar esta provincia?'
    );
    if (!confirmar) return;
    try {
      await fetch(`http://localhost:3000/api/provincias/${id}`, {
        method: 'DELETE',
      });
      setProvincias(provincias.filter((p) => p.id !== id));
      setMensajeFeedback('✅ Provincia eliminada correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (err) {
      console.error('Error al eliminar provincia:', err);
      setMensajeFeedback('❌ Error al eliminar provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  const iniciarEdicion = (id, descripcionActual) => {
    setEditandoId(id);
    setDescripcionEditada(descripcionActual);
    setMensajeFeedback('');
  };

  const guardarEdicion = async () => {
    if (!descripcionEditada.trim()) return;
    const confirmar = window.confirm(
      `¿Estás seguro de que querés guardar los cambios en la provincia "${descripcionEditada}"?`
    );
    if (!confirmar) return;
    try {
      await fetch(`http://localhost:3000/api/provincias/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: descripcionEditada.trim() }),
      });
      const actualizadas = provincias.map((p) =>
        p.id === editandoId
          ? { ...p, descripcion: descripcionEditada.trim() }
          : p
      );
      setProvincias(actualizadas);
      setEditandoId(null);
      setDescripcionEditada('');
      setMensajeFeedback('✅ Provincia modificada correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (err) {
      console.error('Error al editar provincia:', err);
      setMensajeFeedback('❌ Error al editar provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  /* ---------- Paginación + búsqueda ---------- */
  const provinciasFiltradas = useMemo(() => {
    const texto = filtro.toLowerCase();
    return provincias.filter((p) =>
      p.descripcion.toLowerCase().includes(texto)
    );
  }, [provincias, filtro]);

  const totalPaginas = Math.ceil(provinciasFiltradas.length / itemsPorPagina);
  const visibles = provinciasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const irPagina = (n) =>
    setPaginaActual(Math.min(Math.max(n, 1), totalPaginas));
  const paginaAnterior = () => irPagina(paginaActual - 1);
  const paginaSiguiente = () => irPagina(paginaActual + 1);

  /* ---------- Paginación visual (igual a TropaForm) ---------- */
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Encabezado */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
          Administrar Provincias
        </h1>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative" ref={inputRef}>
              <InputField
                label="Nueva provincia"
                value={nuevaDescripcion}
                onChange={manejarBusqueda}
                onFocus={() => {
                  const filtradas = todasLasProvincias.filter((prov) =>
                    prov.toLowerCase().includes(nuevaDescripcion.toLowerCase())
                  );
                  setSugerencias(filtradas);
                  setMostrarSugerencias(true);
                }}
                placeholder="Ingresar provincia..."
              />
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg shadow-lg">
                  {sugerencias.map((prov, idx) => (
                    <li
                      key={idx}
                      onClick={() => seleccionarProvincia(prov)}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer"
                    >
                      {prov}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-end">
              <button
                onClick={agregarProvincia}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow"
              >
                Agregar
              </button>
            </div>
          </div>

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

        {/* Filtro de búsqueda */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <InputField
            label="Buscar provincia"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Escriba para filtrar..."
          />
        </div>

        {/* Tabla de provincias */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Listado de Provincias
          </h2>
          <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Provincia</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((prov) => (
                  <tr
                    key={prov.id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-bold">{prov.id}</td>
                    <td className="px-4 py-3">
                      {editandoId === prov.id ? (
                        <input
                          value={descripcionEditada}
                          onChange={(e) =>
                            setDescripcionEditada(e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded bg-gray-50"
                        />
                      ) : (
                        prov.descripcion
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {editandoId === prov.id ? (
                        <button
                          onClick={guardarEdicion}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                        >
                          Guardar
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            iniciarEdicion(prov.id, prov.descripcion)
                          }
                          className="px-3 py-1 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600 transition"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => eliminarProvincia(prov.id)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {renderPaginacion()}
        </div>
      </div>
    </div>
  );
}

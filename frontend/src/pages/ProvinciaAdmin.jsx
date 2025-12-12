import React, { useState, useEffect, useMemo, useRef } from 'react';

import api from 'src/services/api';

const InputField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  className = '',
  placeholder = '',
  onFocus,
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-2 font-semibold text-gray-700 text-sm">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      required={required}
      placeholder={placeholder}
      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
    />
  </div>
);

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

export default function ProvinciaAdmin() {
  const [provincias, setProvincias] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const [filtro, setFiltro] = useState('');
  const inputRef = useRef(null);

  const [paginaActual, setPaginaActual] = useState(1);
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
      const res = await api.get('/provincias');
      const data = res.data;
      setProvincias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ProvinciaAdmin] Error al cargar provincias:', err);
      setProvincias([]);
      setMensajeFeedback('❌ Error al cargar provincias.');
      setTimeout(() => setMensajeFeedback(''), 4000);
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
      const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      const fetchWithTimeout = (url, options = {}, timeout = 10000) =>
        Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
          ),
        ]);

      try {
        const res = await fetchWithTimeout(
          `${API}/provincias`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: nuevaDescripcion.trim() }),
            // credentials: 'include' // descomentar si usás cookies/sesiones
          },
          10000
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        // manejar data (p. ej. agregar a estado, mostrar feedback)
      } catch (err) {
        console.error('Error creando provincia:', err);
        // mostrar feedback al usuario si corresponde
      }

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
      const { status, data } = await api.delete(`/provincias/${id}`);

      if (status >= 200 && status < 300) {
        setProvincias((prev) =>
          prev.filter((p) => String(p.id) !== String(id))
        );
        setMensajeFeedback('✅ Provincia eliminada correctamente.');
      } else {
        const msg =
          data?.message || data?.error || 'Error al eliminar provincia.';
        setMensajeFeedback(`❌ ${msg}`);
        console.warn('Eliminar provincia no 2xx:', status, msg);
      }
    } catch (err) {
      console.error('Error al eliminar provincia:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error de conexión con el servidor.';
      setMensajeFeedback(`❌ ${msg}`);
    } finally {
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  const iniciarEdicion = (id, descripcionActual) => {
    setEditandoId(id);
    setDescripcionEditada(descripcionActual ?? '');
    setMensajeFeedback('');
  };

  const guardarEdicion = async () => {
    const nuevaDesc = (descripcionEditada || '').trim();
    if (!nuevaDesc) return;

    const confirmar = window.confirm(
      `¿Estás seguro de que querés guardar los cambios en la provincia "${nuevaDesc}"?`
    );
    if (!confirmar) return;

    try {
      const payload = { descripcion: nuevaDesc };
      const { status, data } = await api.put(
        `/provincias/${editandoId}`,
        payload
      );

      if (status >= 200 && status < 300) {
        setProvincias((prev) =>
          prev.map((p) =>
            String(p.id) === String(editandoId)
              ? { ...p, descripcion: nuevaDesc }
              : p
          )
        );
        setEditandoId(null);
        setDescripcionEditada('');
        setMensajeFeedback('✅ Provincia modificada correctamente.');
      } else {
        const msg =
          data?.message || data?.error || 'Error al editar provincia.';
        setMensajeFeedback(`❌ ${msg}`);
        console.warn('Editar provincia no 2xx:', status, msg);
      }
    } catch (err) {
      console.error('Error al editar provincia:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error de conexión con el servidor.';
      setMensajeFeedback(`❌ ${msg}`);
    } finally {
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Título fuera del contenedor */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
          🗺️ Administración de Provincias
        </h1>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative" ref={inputRef}>
              <InputField
                label="Nueva provincia"
                value={nuevaDescripcion}
                onChange={manejarBusqueda}
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

        {/* Tabla de provincias */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Listado de Provincias
          </h2>
          {/* Filtro de búsqueda */}
          <div className="mb-4">
            <InputField
              label="Buscar provincia"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Escriba para filtrar..."
            />
          </div>
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
                          onChange={(e) => setDescripcionEditada(e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                      ) : (
                        <span>{prov.descripcion}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editandoId === prov.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={guardarEdicion}
                            className="px-3 py-1 bg-green-700 text-white rounded-md text-xs font-semibold hover:bg-green-800"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => iniciarEdicion(prov.id, prov.descripcion)}
                            className="px-3 py-1 bg-white text-green-700 border border-green-700 rounded-md text-xs font-semibold hover:bg-green-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarProvincia(prov.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
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
    </div>
  );
}

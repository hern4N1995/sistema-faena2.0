import React, { useState, useEffect, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  InputField institucional (igual que TropaForm / UsuarioPage)      */
/* ------------------------------------------------------------------ */
const InputField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  className = '',
  placeholder = '',
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="mb-2 font-semibold text-gray-700 text-sm">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
    />
  </div>
);

export default function ProductorAdmin() {
  const [nuevoProductor, setNuevoProductor] = useState({
    cuit: '',
    nombre: '',
  });
  const [productores, setProductores] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = window.innerWidth < 768 ? 2 : 4;

  useEffect(() => {
    fetchProductores().finally(() => setLoading(false));
  }, []);

  const fetchProductores = async () => {
    try {
      const res = await fetch('/productores');
      const data = await res.json();
      setProductores(Array.isArray(data) ? data : []);
    } catch {
      setError('Error al cargar productores');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProductor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    const url = editandoId ? `/productores/${editandoId}` : '/productores';
    const method = editandoId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProductor),
      });
      if (!res.ok) throw new Error('Error al guardar productor');
      setMensaje(
        editandoId ? 'Productor modificado ✅' : 'Productor creado ✅'
      );
      setNuevoProductor({ cuit: '', nombre: '' });
      setEditandoId(null);
      setPaginaActual(1);
      await fetchProductores();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (p) => {
    setNuevoProductor({ cuit: p.cuit, nombre: p.nombre });
    setEditandoId(p.id_productor);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este productor?')) return;
    try {
      const res = await fetch(`/productores/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar productor');
      setPaginaActual(1);
      await fetchProductores();
    } catch (err) {
      setError(err.message);
    }
  };

  const productoresFiltrados = useMemo(() => {
    const texto = filtro.toLowerCase();
    return productores.filter(
      (p) =>
        p.cuit.toString().includes(texto) ||
        p.nombre.toLowerCase().includes(texto)
    );
  }, [productores, filtro]);

  const totalPaginas = Math.ceil(productoresFiltrados.length / itemsPorPagina);
  const visibles = productoresFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const irPagina = (n) =>
    setPaginaActual(Math.min(Math.max(n, 1), totalPaginas));
  const paginaAnterior = () => irPagina(paginaActual - 1);
  const paginaSiguiente = () => irPagina(paginaActual + 1);

  const renderPaginacion = () => {
    if (totalPaginas <= 1) return null;

    return (
      <div className="mt-[-4px] flex justify-center items-center gap-2 flex-wrap">
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
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando productores...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center drop-shadow">
          {editandoId ? '👤 Modificar Productor' : '👤 Agregar Productor'}
        </h1>
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <InputField
              label="CUIT"
              name="cuit"
              value={nuevoProductor.cuit}
              onChange={handleChange}
              required
              placeholder="Ej. 20-12345678-9"
            />
            <InputField
              label="Nombre"
              name="nombre"
              value={nuevoProductor.nombre}
              onChange={handleChange}
              required
              placeholder="Ej. Juan Pérez"
            />
            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow"
              >
                {editandoId ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </form>

          {mensaje && (
            <div className="mt-4 flex items-center gap-2 text-green-700">
              <span className="text-lg">✅</span>
              <span>{mensaje}</span>
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-700">
              <span className="text-lg">❌</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Listado */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Productores Registrados
          </h2>
          <input
            type="text"
            placeholder="Buscar por CUIT o nombre"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
          />

          <div className="mt-4 rounded-xl ring-1 ring-gray-200">
            {visibles.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {visibles.map((p) => (
                  <li
                    key={p.id_productor}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-semibold">{p.nombre}</span> —
                        CUIT: {p.cuit}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex gap-2">
                      <button
                        onClick={() => handleEditar(p)}
                        className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700 transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id_productor)}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No se encontraron productores.
              </p>
            )}
          </div>
        </div>

        {/* Paginación externa */}
        {totalPaginas > 1 && renderPaginacion()}
      </div>
    </div>
  );
}

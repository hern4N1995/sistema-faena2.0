import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FaenasRealizadasPage = () => {
  const [faenas, setFaenas] = useState([]);
  const [filtro, setFiltro] = useState({ fecha: '', dte_dtu: '', n_tropa: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFaenas = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filtro).filter(([_, v]) => v.trim() !== '')
        )
      ).toString();

      const res = await fetch(`/api/faenas-realizadas?${query}`);
      const data = await res.json();

      const ordenadas = Array.isArray(data)
        ? [...data].sort(
            (a, b) => new Date(b.fecha_faena) - new Date(a.fecha_faena)
          )
        : [];

      setFaenas(ordenadas);
    } catch (err) {
      console.error('Error al cargar faenas realizadas:', err);
      setFaenas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaenas();
  }, [filtro]);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleDecomisar = (id_faena) => {
    navigate(`/decomiso/nuevo/${id_faena}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
          🧾 Faenas Realizadas
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <input
              type="date"
              value={filtro.fecha}
              onChange={(e) =>
                setFiltro((f) => ({ ...f, fecha: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
            <input
              type="text"
              placeholder="Buscar DTE/DTU"
              value={filtro.dte_dtu}
              onChange={(e) =>
                setFiltro((f) => ({ ...f, dte_dtu: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
            <input
              type="text"
              placeholder="Buscar Nº Tropa"
              value={filtro.n_tropa}
              onChange={(e) =>
                setFiltro((f) => ({ ...f, n_tropa: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Cargando faenas...
        </div>
      ) : faenas.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No se encontraron faenas.
        </div>
      ) : (
        <>
          {/* Vista escritorio */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow ring-1 ring-gray-200">
            <table className="min-w-max text-sm text-center text-gray-700">
              <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-2 py-2 whitespace-nowrap">Fecha</th>
                  <th className="px-2 py-2 whitespace-nowrap">DTE/DTU</th>
                  <th className="px-2 py-2 whitespace-nowrap">Guía Policial</th>
                  <th className="px-2 py-2 whitespace-nowrap">Nº Tropa</th>
                  <th className="px-2 py-2 whitespace-nowrap">Productor</th>
                  <th className="px-2 py-2 whitespace-nowrap">Departamento</th>
                  <th className="px-2 py-2 whitespace-nowrap">Titular</th>
                  <th className="px-2 py-2 whitespace-nowrap">Especie</th>
                  <th className="px-2 py-2 whitespace-nowrap">Faenado</th>
                  <th className="px-2 py-2 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {faenas.map((f) => (
                  <tr
                    key={f.id_faena}
                    className="border-b last:border-b-0 hover:bg-green-50 transition"
                  >
                    <td className="px-2 py-2 whitespace-nowrap">
                      {formatDate(f.fecha_faena)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {f.dte_dtu || '—'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {f.guia_policial || '—'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap font-semibold text-green-800">
                      {f.n_tropa}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {f.productor}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {f.departamento}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {f.titular_faena}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">{f.especie}</td>
                    <td className="px-2 py-2 whitespace-nowrap font-bold">
                      {f.total_faenado}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleDecomisar(f.id_faena)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                      >
                        Decomisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden grid gap-4 mt-6">
            {faenas.map((f) => (
              <div
                key={f.id_faena}
                className="bg-white rounded-xl shadow p-4 ring-1 ring-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-green-800">
                    Tropa {f.n_tropa}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(f.fecha_faena)}
                  </span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">DTE/DTU:</span>{' '}
                    {f.dte_dtu || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Guía:</span>{' '}
                    {f.guia_policial || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Productor:</span>{' '}
                    {f.productor}
                  </div>
                  <div>
                    <span className="font-medium">Departamento:</span>{' '}
                    {f.departamento}
                  </div>
                  <div>
                    <span className="font-medium">Titular:</span>{' '}
                    {f.titular_faena}
                  </div>
                  <div>
                    <span className="font-medium">Especie:</span> {f.especie}
                  </div>
                  <div>
                    <span className="font-medium">Faenado:</span>{' '}
                    {f.total_faenado}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDecomisar(f.id_faena)}
                    className="text-sm px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                  >
                    Decomisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FaenasRealizadasPage;

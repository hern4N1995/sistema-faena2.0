import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

const DecomisosCargadosPage = () => {
  const [decomisos, setDecomisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const rowsPerPage = isMobile ? 3 : 6;

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No hay token disponible. Iniciá sesión nuevamente.');
      setLoading(false);
      return;
    }

    fetch('/api/decomisos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener decomisos');
        return res.json();
      })
      .then((data) => {
        setDecomisos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error al cargar decomisos:', err);
        setError('No se pudo cargar la lista de decomisos');
        setLoading(false);
      });
  }, []);

  const formatFecha = (fecha) => {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleVerResumen = (id) => {
    navigate(`/decomisos/detalle/${id}`);
  };

  /* ---------------------------------------------------------- */
  /*  Paginación                                                */
  /* ---------------------------------------------------------- */
  const totalPages = Math.ceil(decomisos.length / rowsPerPage);
  const paginatedDecomisos = decomisos.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const renderPaginacion = () => {
    if (totalPages <= 1) return null;
    <div className="text-center text-xs text-slate-500 mb-2">
      Mostrando {paginatedDecomisos.length} de {decomisos.length} decomisos
    </div>;
    return (
      <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
            currentPage === 1
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
          }`}
        >
          ← Anterior
        </button>

        {[...Array(Math.min(3, totalPages))].map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                currentPage === page
                  ? 'bg-green-700 text-white shadow'
                  : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {totalPages > 3 && (
          <>
            <span className="text-slate-500 text-sm">…</span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                currentPage === totalPages
                  ? 'bg-green-700 text-white shadow'
                  : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

  /* ---------------------------------------------------------- */
  /*  Card móvil                                                */
  /* ---------------------------------------------------------- */
  const DecomisoCard = ({ d }) => (
    <div className="rounded-xl shadow-sm border p-4 mb-4 bg-white border-slate-200 transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">
          {formatFecha(d.fecha_faena)}
        </span>
        <span className="text-sm font-semibold text-green-800">
          Faena #{d.n_tropa}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <strong>DTE/DTU:</strong> {d.dte_dtu || '—'}
        </p>
        <p>
          <strong>Cant. Tropa:</strong> {d.cantidad_tropa}
        </p>
        <p>
          <strong>Faenados:</strong> {d.cantidad_faena}
        </p>
        <p>
          <strong>Decomisados:</strong> {d.cantidad_decomisada}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => handleVerResumen(d.id_decomiso)}
          className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition shadow text-sm"
        >
          Ver resumen
        </button>
      </div>
    </div>
  );

  /* ---------------------------------------------------------- */
  /*  Vista principal                                           */
  /* ---------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center drop-shadow mb-10">
          📦 Decomisos Cargados
        </h1>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mt-10">
          <p className="text-base">❌ {error}</p>
        </div>
      ) : paginatedDecomisos.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-base">⚠️ No hay decomisos cargados.</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {paginatedDecomisos.map((d) => (
                <DecomisoCard key={d.id_decomiso} d={d} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200">
                <table className="min-w-[900px] w-full text-sm text-center text-slate-700">
                  <thead className="bg-green-700 text-white uppercase tracking-wide text-xs">
                    <tr>
                      <th className="px-3 py-3">Fecha Faena</th>
                      <th className="px-3 py-3">N° Tropa</th>
                      <th className="px-3 py-3">DTE / DTU</th>
                      <th className="px-3 py-3">Cant. Tropa</th>
                      <th className="px-3 py-3">Faenados</th>
                      <th className="px-3 py-3">Decomisados</th>
                      <th className="px-3 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDecomisos.map((d) => (
                      <tr
                        key={d.id_decomiso}
                        className="border-b last:border-b-0 bg-white hover:bg-green-50 transition"
                      >
                        <td className="px-3 py-3">
                          {formatFecha(d.fecha_faena)}
                        </td>
                        <td className="px-3 py-3 font-semibold text-green-800">
                          {d.n_tropa}
                        </td>
                        <td className="px-3 py-3 truncate">
                          {d.dte_dtu || '—'}
                        </td>
                        <td className="px-3 py-3">{d.cantidad_tropa}</td>
                        <td className="px-3 py-3">{d.cantidad_faena}</td>
                        <td className="px-3 py-3 font-semibold">
                          {d.cantidad_decomisada}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleVerResumen(d.id_decomiso)}
                            className="px-3 py-1 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-xs font-semibold shadow"
                          >
                            Ver resumen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ✅ Paginación única (sin duplicados) */}
          {renderPaginacion()}
        </>
      )}
    </div>
  );
};

export default DecomisosCargadosPage;

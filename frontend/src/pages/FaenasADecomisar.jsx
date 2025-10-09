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

const FaenasADecomisar = () => {
  const [faenas, setFaenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirigiendoId, setRedirigiendoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const rowsPerPage = isMobile ? 3 : 6;

  const fetchFaenas = async () => {
    try {
      const res = await fetch('/api/faenas-sin-decomiso', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      const conFaenados = data.filter((f) => parseInt(f.total_faenado) > 0);
      const ordenadas = conFaenados.sort(
        (a, b) => new Date(b.fecha_faena) - new Date(a.fecha_faena)
      );
      setFaenas(ordenadas);
    } catch (err) {
      console.error('Error al cargar faenas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaenas();
  }, []);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleDecomisar = (f) => {
    setRedirigiendoId(f.id_faena);
    navigate(`/decomisos/nuevo/${f.id_faena}`);
  };

  /* ---------------------------------------------------------- */
  /*  Paginación                                                */
  /* ---------------------------------------------------------- */
  const totalPages = Math.ceil(faenas.length / rowsPerPage);
  const paginatedFaenas = faenas.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ---------------------------------------------------------- */
  /*  Card móvil                                                */
  /* ---------------------------------------------------------- */
  const FaenaCard = ({ f }) => (
    <div className="rounded-lg shadow-sm border p-3 mb-3 bg-white border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">
          {formatDate(f.fecha_faena)}
        </span>
        <span className="text-sm font-semibold text-green-800">
          Faena #{f.id_faena}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <strong>DTE/DTU:</strong> {f.dte_dtu || '—'}
        </p>
        <p>
          <strong>Guía Policial:</strong> {f.guia_policial || '—'}
        </p>
        <p>
          <strong>Productor:</strong> {f.productor || '—'}
        </p>
        <p>
          <strong>Departamento:</strong> {f.departamento || '—'}
        </p>
        <p>
          <strong>Titular Faena:</strong> {f.titular_faena || '—'}
        </p>
        <p>
          <strong>Especie:</strong> {f.especie || '—'}
        </p>
        <p>
          <strong>Total faenado:</strong> {f.total_faenado ?? '—'}
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => handleDecomisar(f)}
          disabled={redirigiendoId === f.id_faena}
          className={`text-sm px-3 py-2 rounded font-semibold transition ${
            redirigiendoId === f.id_faena
              ? 'bg-green-300 text-white cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {redirigiendoId === f.id_faena ? 'Redirigiendo...' : 'Decomisar'}
        </button>
      </div>
    </div>
  );

  /* ---------------------------------------------------------- */
  /*  Paginación visual (botones)                               */
  /* ---------------------------------------------------------- */
  const renderPaginacion = () => {
    if (totalPages <= 1) return null;

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
  /*  Vista principal                                           */
  /* ---------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center drop-shadow mb-10">
          🩺 Faenas a Decomisar
        </h1>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : paginatedFaenas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-base">No hay faenas con animales faenados.</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="max-w-2xl mx-auto space-y-3">
              {paginatedFaenas.map((f) => (
                <FaenaCard key={f.id_faena} f={f} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200">
                <table className="min-w-[900px] w-full text-sm text-center text-slate-700">
                  <thead className="bg-green-700 text-white uppercase tracking-wide text-xs">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">DTE/DTU</th>
                      <th className="px-3 py-2">Guía Policial</th>
                      <th className="px-3 py-2">Nº Tropa</th>
                      <th className="px-3 py-2">Productor</th>
                      <th className="px-3 py-2">Departamento</th>
                      <th className="px-3 py-2">Titular Faena</th>
                      <th className="px-3 py-2">Especie</th>
                      <th className="px-3 py-2">Faenados</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFaenas.map((f) => (
                      <tr
                        key={f.id_faena}
                        className="border-b last:border-b-0 bg-white hover:bg-green-50 transition"
                      >
                        <td className="px-3 py-3">
                          {formatDate(f.fecha_faena)}
                        </td>
                        <td className="px-3 py-3">{f.dte_dtu || '—'}</td>
                        <td className="px-3 py-3">{f.guia_policial || '—'}</td>
                        <td className="px-3 py-3 font-semibold text-green-800">
                          {f.n_tropa || '—'}
                        </td>
                        <td className="px-3 py-3">{f.productor || '—'}</td>
                        <td className="px-3 py-3">{f.departamento || '—'}</td>
                        <td className="px-3 py-3">{f.titular_faena || '—'}</td>
                        <td className="px-3 py-3">{f.especie || '—'}</td>
                        <td className="px-3 py-3 font-semibold">
                          {f.total_faenado ?? '—'}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleDecomisar(f)}
                            disabled={redirigiendoId === f.id_faena}
                            className={`text-xs px-3 py-1 rounded font-semibold transition ${
                              redirigiendoId === f.id_faena
                                ? 'bg-green-300 text-white cursor-not-allowed'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {redirigiendoId === f.id_faena
                              ? 'Redirigiendo...'
                              : 'Decomisar'}
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
export default FaenasADecomisar;

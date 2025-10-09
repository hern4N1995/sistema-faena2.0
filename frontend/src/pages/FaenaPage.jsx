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

const FaenaPage = () => {
  const [tropas, setTropas] = useState([]);
  const [totalFaenar, setTotalFaenar] = useState(0); // ✅ nuevo estado
  const [loading, setLoading] = useState(true);
  const [redirigiendoId, setRedirigiendoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const rowsPerPage = isMobile ? 3 : isTablet ? 5 : 7;

  const fetchTropas = async () => {
    try {
      const res = await fetch('/api/faena/tropas');
      const data = await res.json();
      const disponibles = data.filter((t) => parseInt(t.total_a_faenar) > 0);
      const ordenadas = disponibles.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      const totalGeneral = disponibles.reduce(
        (acc, t) => acc + (parseInt(t.total_a_faenar) || 0),
        0
      );
      setTropas(ordenadas);
      setTotalFaenar(totalGeneral); // ✅ guardar total
    } catch (err) {
      console.error('Error al cargar tropas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTropas();
  }, []);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleFaenar = async (t) => {
    setRedirigiendoId(t.id_tropa);
    const destino = t.id_faena
      ? `/faena/${t.id_faena}`
      : `/faena/nueva/${t.id_tropa}`;
    navigate(destino);
    setTimeout(() => {
      fetchTropas();
      setRedirigiendoId(null);
    }, 1000);
  };

  const esTropaVencida = (t) => {
    const fechaTropa = new Date(t.fecha);
    const hoy = new Date();
    const diferenciaDias = (hoy - fechaTropa) / (1000 * 60 * 60 * 24);
    return diferenciaDias > 2 && parseInt(t.total_a_faenar) > 0;
  };

  const TropaCard = ({ t }) => (
    <div
      className={`rounded-xl shadow border p-4 mb-4 ${
        esTropaVencida(t)
          ? 'bg-red-300 border-red-500'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">{formatDate(t.fecha)}</span>
        <span className="text-sm font-semibold text-green-800">
          Tropa #{t.n_tropa}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <strong>DTE/DTU:</strong> {t.dte_dtu || '—'}
        </p>
        <p>
          <strong>Guía Policial:</strong> {t.guia_policial || '—'}
        </p>
        <p>
          <strong>Productor:</strong> {t.productor || '—'}
        </p>
        <p>
          <strong>Departamento:</strong> {t.departamento || '—'}
        </p>
        <p>
          <strong>Titular Faena:</strong> {t.titular_faena || '—'}
        </p>
        <p>
          <strong>Especie:</strong> {t.especie || '—'}
        </p>
        <p>
          <strong>Total a faenar:</strong> {t.total_a_faenar ?? '—'}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => handleFaenar(t)}
          disabled={redirigiendoId === t.id_tropa}
          className={`text-sm px-3 py-2 rounded font-semibold transition ${
            redirigiendoId === t.id_tropa
              ? 'bg-green-300 text-white cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {redirigiendoId === t.id_tropa ? 'Redirigiendo...' : 'Faenar'}
        </button>
      </div>
    </div>
  );

  const totalPages = Math.ceil(tropas.length / rowsPerPage);
  const paginatedTropas = tropas.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-6">
      <header className="mb-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 drop-shadow mb-6">
          📋 Tropas a Faenar
        </h1>
        <div className="mt-2 mr-10 flex justify-end">
          <p className="text-base font-semibold text-green-700">
            Total general a faenar:{' '}
            <span className="text-green-900">{totalFaenar}</span>
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : tropas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-lg">No hay tropas disponibles para faenar.</p>
        </div>
      ) : isMobile ? (
        <div className="max-w-2xl mx-auto">
          {paginatedTropas.map((t) => (
            <TropaCard key={t.id_tropa} t={t} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200">
            <table className="min-w-[800px] w-full text-sm text-center text-slate-700">
              <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">DTE/DTU</th>
                  <th className="px-3 py-2">Guía Policial</th>
                  <th className="px-3 py-2">Nº Tropa</th>
                  <th className="px-3 py-2">Productor</th>
                  <th className="px-3 py-2">Departamento</th>
                  <th className="px-3 py-2">Titular Faena</th>
                  <th className="px-3 py-2">Especie</th>
                  <th className="px-3 py-2">Total a faenar</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTropas.map((t) => (
                  <tr
                    key={t.id_tropa}
                    className={`border-b last:border-b-0 transition-colors ${
                      esTropaVencida(t)
                        ? 'bg-red-400 hover:bg-red-500'
                        : 'bg-white hover:bg-green-50'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {formatDate(t.fecha)}
                    </td>
                    <td className="px-3 py-2">{t.dte_dtu || '—'}</td>
                    <td className="px-3 py-2">{t.guia_policial || '—'}</td>
                    <td className="px-3 py-2 font-semibold text-green-800">
                      {t.n_tropa || '—'}
                    </td>
                    <td className="px-3 py-2">{t.productor || '—'}</td>
                    <td className="px-3 py-2">{t.departamento || '—'}</td>
                    <td className="px-3 py-2">{t.titular_faena || '—'}</td>
                    <td className="px-3 py-2">{t.especie || '—'}</td>
                    <td className="px-3 py-2 font-semibold">
                      {t.total_a_faenar ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleFaenar(t)}
                        disabled={redirigiendoId === t.id_tropa}
                        className={`text-xs px-2 py-1 rounded font-semibold transition ${
                          redirigiendoId === t.id_tropa
                            ? 'bg-green-300 text-white cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {redirigiendoId === t.id_tropa
                          ? 'Redirigiendo...'
                          : 'Faenar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tropas.length > rowsPerPage && (
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
      )}
    </div>
  );
};

export default FaenaPage;

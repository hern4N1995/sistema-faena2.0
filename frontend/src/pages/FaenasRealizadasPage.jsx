import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

export default function FaenasRealizadasPage() {
  const [faenas, setFaenas] = useState([]);
  const [filtro, setFiltro] = useState({ desde: '', hasta: '', n_tropa: '' });
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  // filas por página configurables: 4, 7, 10, 20
  const rowsPerPageOptions = [4, 7, 10, 20];
  const initialRows = isMobile ? 4 : isTablet ? 4 : 4;
  const [rowsPerPage, setRowsPerPage] = useState(initialRows);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalFaenados, setTotalFaenados] = useState(0);

  // Orden por fecha: 'desc' = más recientes primero; 'asc' = más antiguas primero
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  const navigate = useNavigate();

  const fetchFaenas = async () => {
    setLoading(true);
    try {
      const params = {};
      const desde = filtro.desde?.trim();
      const hasta = filtro.hasta?.trim();

      if (desde && hasta) {
        params.desde = desde;
        params.hasta = hasta;
      } else if (desde) {
        params.fecha = desde;
      } else if (hasta) {
        params.fecha = hasta;
      }

      if (filtro.n_tropa && String(filtro.n_tropa).trim() !== '') {
        params.n_tropa = filtro.n_tropa;
      }

      const query = new URLSearchParams(params).toString();
      const url = query
        ? `/api/faenas-realizadas?${query}`
        : `/api/faenas-realizadas`;
      const res = await fetch(url);
      const data = await res.json();

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.faenas)
        ? data.faenas
        : [];

      setFaenas(arr);

      const total = arr.reduce((acc, item) => {
        const v = Number(item.total_faenado ?? 0);
        return acc + (Number.isFinite(v) ? v : 0);
      }, 0);
      setTotalFaenados(total);

      // cuando recargamos por filtro, aseguramos volver a página 1
      setCurrentPage(1);
    } catch (err) {
      console.error('Error al cargar faenas realizadas:', err);
      setFaenas([]);
      setTotalFaenados(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaenas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  // cuando cambia rowsPerPage o sortOrder volver a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, sortOrder]);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleDecomisar = (id_faena) => {
    navigate(`/decomisos/nuevo/${id_faena}`);
  };
  // Ordenar y paginar (memoizados)
  const sortedFaenas = useMemo(() => {
    if (!Array.isArray(faenas)) return [];
    const copy = [...faenas];
    copy.sort((a, b) => {
      const da = a?.fecha_faena ? new Date(a.fecha_faena).getTime() : -Infinity;
      const db = b?.fecha_faena ? new Date(b.fecha_faena).getTime() : -Infinity;
      if (sortOrder === 'desc') return db - da;
      return da - db;
    });
    return copy;
  }, [faenas, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedFaenas.length / rowsPerPage));

  // asegurar currentPage válido si totalPages cambia
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedFaenas = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedFaenas.slice(start, start + rowsPerPage);
  }, [sortedFaenas, currentPage, rowsPerPage]);

  // Construir botones de página mostrando 1, last, ventana centrada y ellipsis
  const getPageButtons = () => {
    const maxButtons = 7;
    if (totalPages <= maxButtons)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set();
    pages.add(1);
    pages.add(totalPages);

    const side = 2;
    let start = Math.max(2, currentPage - side);
    let end = Math.min(totalPages - 1, currentPage + side);

    if (currentPage <= 1 + side) {
      start = 2;
      end = Math.min(totalPages - 1, 2 + side * 2);
    }
    if (currentPage >= totalPages - side) {
      start = Math.max(2, totalPages - (2 + side * 2));
      end = totalPages - 1;
    }

    for (let p = start; p <= end; p++) pages.add(p);

    return Array.from(pages).sort((a, b) => a - b);
  };

  const renderPageButtons = () => {
    const pages = getPageButtons();
    const elems = [];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const prev = pages[i - 1];
      if (i > 0 && page - prev > 1) {
        elems.push(
          <span key={`ellipsis-${i}`} className="text-slate-500 px-2">
            …
          </span>
        );
      }
      elems.push(
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
            currentPage === page
              ? 'bg-green-700 text-white shadow'
              : 'bg-white text-green-700 border border-green-700 hover:bg-green-50'
          }`}
        >
          {page}
        </button>
      );
    }
    return elems;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 drop-shadow mb-6">
          🧾 Faenas Realizadas
        </h1>

        <div className="flex justify-center mb-4">
          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filtro.desde}
                  onChange={(e) =>
                    setFiltro((f) => ({ ...f, desde: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={filtro.hasta}
                  onChange={(e) =>
                    setFiltro((f) => ({ ...f, hasta: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  Buscar Nº Tropa
                </label>
                <input
                  type="text"
                  placeholder="N° Tropa"
                  value={filtro.n_tropa}
                  onChange={(e) =>
                    setFiltro((f) => ({ ...f, n_tropa: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-3xl flex items-center justify-between gap-4">
            <div className="text-sm text-slate-700">
              <span className="font-medium">Total faenados:</span>{' '}
              <span className="font-bold text-green-700">{totalFaenados}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500 mr-2">
                <span className="mr-2">Mostrando</span>
                <span className="font-medium">{faenas.length}</span>
                <span className="ml-1">registro(s)</span>
              </div>

              {/* Selector filas por página */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Filas</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  {rowsPerPageOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de orden por fecha */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Orden</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="desc">Más recientes primero</option>
                  <option value="asc">Más antiguas primero</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : paginatedFaenas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-lg">No se encontraron faenas.</p>
        </div>
      ) : (
        <>
          {/* Vista escritorio */}
          <div className="hidden md:block flex justify-center">
            <div className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200">
              <table className="min-w-[900px] w-full text-sm text-center text-slate-700">
                <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">DTE/DTU</th>
                    <th className="px-3 py-3">Guía Policial</th>
                    <th className="px-3 py-3">Nº Tropa</th>
                    <th className="px-3 py-3">Productor</th>
                    <th className="px-3 py-3">Departamento</th>
                    <th className="px-3 py-3">Titular</th>
                    <th className="px-3 py-3">Especie</th>
                    <th className="px-3 py-3">Faenado</th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFaenas.map((f) => (
                    <tr
                      key={f.id_faena}
                      className="border-b last:border-b-0 transition-colors bg-white hover:bg-green-50"
                    >
                      <td className="px-3 py-3 font-medium">
                        {formatDate(f.fecha_faena)}
                      </td>
                      <td className="px-3 py-3">{f.dte_dtu || '—'}</td>
                      <td className="px-3 py-3">{f.guia_policial || '—'}</td>
                      <td className="px-3 py-3 font-semibold text-green-800">
                        {f.n_tropa}
                      </td>
                      <td className="px-3 py-3">{f.productor}</td>
                      <td className="px-3 py-3">{f.departamento}</td>
                      <td className="px-3 py-3">{f.titular_faena}</td>
                      <td className="px-3 py-3">{f.especie}</td>
                      <td className="px-3 py-3 font-bold">{f.total_faenado}</td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => handleDecomisar(f.id_faena)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                        >
                          Decomisar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden grid gap-4 mt-6">
            {paginatedFaenas.map((f) => (
              <div
                key={f.id_faena}
                className="bg-white rounded-2xl shadow-lg p-4 ring-1 ring-slate-200 transition-transform hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-green-800">
                    Tropa {f.n_tropa}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(f.fecha_faena)}
                  </span>
                </div>
                <div className="text-sm text-slate-700 space-y-1">
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
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition"
                  >
                    Decomisar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Paginación profesional */}
      {sortedFaenas.length > 0 && (
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

          {renderPageButtons()}

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
}

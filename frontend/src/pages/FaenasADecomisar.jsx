import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

export default function FaenasADecomisar() {
  const [faenas, setFaenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirigiendoId, setRedirigiendoId] = useState(null);
  const [rol, setRol] = useState(null);
  const [plantaDelUsuario, setPlantaDelUsuario] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 3 : 6);

  // filtro por día relativo: 'actual' | 'anterior' | 'siguiente' | 'todas'
  const [dayFilterMode, setDayFilterMode] = useState('todas');

  // Obtener rol y planta del usuario desde localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        const userRol = userData.id_rol || userData.rol;
        setRol(parseInt(userRol));
        
        // Usar id_planta del usuario (viene del backend)
        if (parseInt(userRol) !== 1) {
          setPlantaDelUsuario(userData.id_planta);
        }
      }
    } catch (err) {
      console.error('[FaenasADecomisar] Error al obtener usuario:', err);
      setRol(1); // Default a admin para mostrar datos
    }
  }, []);

  // fetch inicial
  const fetchFaenas = async () => {
    setLoading(true);
    try {
      console.log('[FaenasADecomisar] Cargando faenas sin decomiso');
      const res = await api.get('/faena/faenas-sin-decomiso');
      
      const data = res.data;
      let arr = Array.isArray(data) ? data : Array.isArray(data?.faenas) ? data.faenas : [];
      
      // Filtrar por planta del usuario (si no es admin)
      if (rol !== 1 && plantaDelUsuario) {
        console.log('[FaenasADecomisar] Filtrando por planta del usuario:', plantaDelUsuario);
        arr = arr.filter(
          (f) =>
            String(f.id_planta) === String(plantaDelUsuario)
        );
        console.log('[FaenasADecomisar] Después de filtrar:', arr.length, 'faenas');
      } else if (rol === 1) {
        console.log('[FaenasADecomisar] Admin - mostrando todas las faenas');
      }
      
      const conFaenados = arr.filter((f) => Number(f.total_faenado) > 0);
      const ordenadas = [...conFaenados].sort(
        (a, b) => new Date(b.fecha_faena) - new Date(a.fecha_faena)
      );
      setFaenas(ordenadas);
      setCurrentPage(1);
    } catch (err) {
      console.error('[FaenasADecomisar] Error al cargar faenas:', err?.response?.data || err.message);
      setFaenas([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rol !== null) {
      fetchFaenas();
    }

    const handleResize = () => {
      setRowsPerPage(window.matchMedia('(max-width: 767px)').matches ? 3 : 6);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol, plantaDelUsuario]);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleDecomisar = (f) => {
    setRedirigiendoId(f.id_faena);
    navigate(`/decomisos/nuevo/${f.id_faena}`);
  };

  // --- fechas únicas (YYYY-MM-DD) descendentes ---
  const uniqueDatesDesc = useMemo(() => {
    const s = new Set();
    for (const f of faenas) {
      if (!f?.fecha_faena) continue;
      const d = new Date(f.fecha_faena);
      if (isNaN(d.getTime())) continue;
      s.add(d.toISOString().slice(0, 10));
    }
    return Array.from(s).sort((a, b) => (a < b ? 1 : -1)); // descendente
  }, [faenas]);

  // Mapeo: index 0 = más reciente, index1 = anteúltimo, index2 = ante-anteúltimo
  const mostRecentDate = uniqueDatesDesc.length > 0 ? uniqueDatesDesc[0] : null;
  const previousDate = uniqueDatesDesc.length > 1 ? uniqueDatesDesc[1] : null; // anteúltima
  const nextDate = uniqueDatesDesc.length > 2 ? uniqueDatesDesc[2] : null; // ante-anteúltima

  // seleccionar fecha usada según el modo (null = sin filtro por fecha)
  const selectedDateForFilter = useMemo(() => {
    if (dayFilterMode === 'todas') return null;
    if (dayFilterMode === 'actual') return mostRecentDate;
    if (dayFilterMode === 'anterior') return previousDate;
    if (dayFilterMode === 'siguiente') return nextDate;
    return null;
  }, [dayFilterMode, mostRecentDate, previousDate, nextDate]);

  // filtrar por la fecha seleccionada (si aplica)
  const filteredFaenas = useMemo(() => {
    if (!selectedDateForFilter) return faenas;
    return faenas.filter((f) => {
      if (!f?.fecha_faena) return false;
      return (
        new Date(f.fecha_faena).toISOString().slice(0, 10) ===
        selectedDateForFilter
      );
    });
  }, [faenas, selectedDateForFilter]);

  // paginación calculada
  const totalPages = Math.max(
    1,
    Math.ceil(filteredFaenas.length / rowsPerPage)
  );

  // asegurar currentPage válido cuando cambian totalPages o rowsPerPage
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // reset página al cambiar filtro o cuando cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [dayFilterMode, selectedDateForFilter, rowsPerPage, faenas.length]);

  const paginatedFaenas = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredFaenas.slice(start, start + rowsPerPage);
  }, [filteredFaenas, currentPage, rowsPerPage]);

  // --- paginación: ventana centrada con ellipsis ---
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

  // Helper: manejar toggle con posibilidad de deseleccionar (click en activo -> 'todas')
  const handleToggle = (mode) => {
    if (dayFilterMode === mode) {
      setDayFilterMode('todas');
      return;
    }
    setDayFilterMode(mode);
  };

  /* -------------------------
     Render helpers / styles
     ------------------------- */
  const FaenaCard = ({ f }) => (
    <div
      className="rounded-lg shadow-sm border p-3 mb-3 bg-white border-slate-200"
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        whiteSpace: 'normal',
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">
          {formatDate(f.fecha_faena)}
        </span>
        <span className="text-sm font-semibold text-green-800">
          Faena #{f.id_faena}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p className="whitespace-normal break-words">
          <strong>DTE/DTU:</strong> {f.dte_dtu || '—'}
        </p>
        <p className="whitespace-normal break-words">
          <strong>Guía Policial:</strong> {f.guia_policial || '—'}
        </p>
        <p className="whitespace-normal break-words">
          <strong>Productor:</strong> {f.productor || '—'}
        </p>
        <p className="whitespace-normal break-words">
          <strong>Departamento:</strong> {f.departamento || '—'}
        </p>
        <p className="whitespace-normal break-words">
          <strong>Titular Faena:</strong> {f.titular_faena || '—'}
        </p>
        <p className="whitespace-normal break-words">
          <strong>Especie:</strong> {f.especie || '—'}
        </p>
        <p className="whitespace-normal break-words">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-6 box-border pb-24">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center drop-shadow mb-6">
          🩺 Decomisos
        </h1>

        {/* Controles: leyenda con casillas redondeadas (solo el recuadro es clickable) */}
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 select-none">
                <span className="text-sm text-slate-700">Actual</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-pressed={dayFilterMode === 'actual'}
                  onClick={() => handleToggle('actual')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    handleToggle('actual')
                  }
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition ml-1 cursor-pointer ${
                    dayFilterMode === 'actual'
                      ? 'bg-green-700'
                      : 'bg-white border border-slate-300'
                  }`}
                  title="Mostrar faenas del día más reciente"
                  style={{ outline: 'none' }}
                >
                  {dayFilterMode === 'actual' ? (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ pointerEvents: 'none' }}
                    >
                      <path
                        d="M1 4L4 7L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 select-none ${
                  !previousDate ? 'opacity-50' : ''
                }`}
              >
                <span className="text-sm text-slate-700">Anterior</span>
                <span
                  role="button"
                  tabIndex={previousDate ? 0 : -1}
                  aria-pressed={dayFilterMode === 'anterior'}
                  onClick={() => previousDate && handleToggle('anterior')}
                  onKeyDown={(e) =>
                    previousDate &&
                    (e.key === 'Enter' || e.key === ' ') &&
                    handleToggle('anterior')
                  }
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition ml-1 cursor-pointer ${
                    dayFilterMode === 'anterior'
                      ? 'bg-green-700'
                      : 'bg-white border border-slate-300'
                  }`}
                  title={
                    previousDate
                      ? `Mostrar faenas de ${formatDate(previousDate)}`
                      : 'No hay fecha anterior disponible'
                  }
                  style={{ outline: 'none' }}
                >
                  {dayFilterMode === 'anterior' ? (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ pointerEvents: 'none' }}
                    >
                      <path
                        d="M1 4L4 7L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 select-none ${
                  !nextDate ? 'opacity-50' : ''
                }`}
              >
                <span className="text-sm text-slate-700">Siguiente</span>
                <span
                  role="button"
                  tabIndex={nextDate ? 0 : -1}
                  aria-pressed={dayFilterMode === 'siguiente'}
                  onClick={() => nextDate && handleToggle('siguiente')}
                  onKeyDown={(e) =>
                    nextDate &&
                    (e.key === 'Enter' || e.key === ' ') &&
                    handleToggle('siguiente')
                  }
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition ml-1 cursor-pointer ${
                    dayFilterMode === 'siguiente'
                      ? 'bg-green-700'
                      : 'bg-white border border-slate-300'
                  }`}
                  title={
                    nextDate
                      ? `Mostrar faenas de ${formatDate(nextDate)}`
                      : 'No hay fecha siguiente disponible'
                  }
                  style={{ outline: 'none' }}
                >
                  {dayFilterMode === 'siguiente' ? (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ pointerEvents: 'none' }}
                    >
                      <path
                        d="M1 4L4 7L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>

              <div className="flex items-center gap-2 select-none">
                <span className="text-sm text-slate-700">Todas</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-pressed={dayFilterMode === 'todas'}
                  onClick={() => handleToggle('todas')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    handleToggle('todas')
                  }
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition ml-1 cursor-pointer ${
                    dayFilterMode === 'todas'
                      ? 'bg-green-700'
                      : 'bg-white border border-slate-300'
                  }`}
                  title="Mostrar todas las faenas"
                  style={{ outline: 'none' }}
                >
                  {dayFilterMode === 'todas' ? (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ pointerEvents: 'none' }}
                    >
                      <path
                        d="M1 4L4 7L11 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500">Resultados</span>
                <div className="text-sm text-slate-700">
                  {filteredFaenas.length} registro(s)
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <div
              className="max-w-full mx-auto px-3"
              style={{ boxSizing: 'border-box' }}
            >
              {paginatedFaenas.map((f) => (
                <FaenaCard key={f.id_faena} f={f} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200 max-w-full">
                <table
                  className="w-full text-sm text-center text-slate-700"
                  style={{ tableLayout: 'auto' }}
                >
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
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {formatDate(f.fecha_faena)}
                        </td>
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {f.dte_dtu || '—'}
                        </td>
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {f.guia_policial || '—'}
                        </td>
                        <td className="px-2 py-2 font-semibold text-green-800 whitespace-normal break-words">
                          {f.n_tropa || '—'}
                        </td>
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {f.productor || '—'}
                        </td>
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {f.departamento || '—'}
                        </td>
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {f.titular_faena || '—'}
                        </td>
                        <td className="px-2 py-2 whitespace-normal break-words">
                          {f.especie || '—'}
                        </td>
                        <td className="px-2 py-2 font-semibold whitespace-normal break-words">
                          {f.total_faenado ?? '—'}
                        </td>
                        <td className="px-2 py-2">
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

          {/* Paginación profesional */}
          {filteredFaenas.length > 0 && (
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
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
        </>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';

/* SelectField compatible con TropaForm (react-select) */
function SelectField({
  label,
  value,
  options = [],
  onChange,
  placeholder = '',
  className = '',
}) {
  const [isFocusing, setIsFocusing] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      minHeight: '48px',
      paddingLeft: '12px',
      paddingRight: '12px',
      backgroundColor: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: isFocusing
        ? '0 0 0 1px #000'
        : state.isFocused
        ? '0 0 0 4px #d1fae5'
        : 'none',
      transition: 'all 50ms ease',
      '&:hover': { borderColor: '#96f1b7' },
      '&:focus-within': { borderColor: '#22c55e' },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 6px',
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
    }),
    placeholder: (base) => ({ ...base, fontSize: '14px', color: '#6b7280' }),
    indicatorsContainer: (base) => ({ ...base, height: '48px' }),
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
    <div className={`flex flex-col ${className}`} style={{ minWidth: 0 }}>
      {label && (
        <label className="mb-2 font-semibold text-gray-700 text-sm">
          {label}
        </label>
      )}
      <Select
        value={value}
        onChange={(sel) => onChange(sel)}
        options={options}
        placeholder={placeholder}
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

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split('.')?.[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};

export default function FaenasRealizadasPage() {
  const navigate = useNavigate();

  const [faenas, setFaenas] = useState([]);
  const [filtro, setFiltro] = useState({ desde: '', hasta: '', n_tropa: '' });
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);
  const [plantaDelUsuario, setPlantaDelUsuario] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState('');

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const rowsPerPageOptions = [4, 7, 10, 20];
  const sortOptions = [
    { value: 'desc', label: 'Más recientes primero' },
    { value: 'asc', label: 'Más antiguas primero' },
  ];

  const initialRows = isMobile ? 4 : isTablet ? 4 : 4;
  const [rowsPerPage, setRowsPerPage] = useState(initialRows);
  const [sortOrder, setSortOrder] = useState(sortOptions[0]); // objeto {value,label}
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFaenados, setTotalFaenados] = useState(0);

  // Obtener rol y planta del usuario desde localStorage; si falta, recuperar desde token.
  useEffect(() => {
    let cancelled = false;

    const loadUserContext = async () => {
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const userData = JSON.parse(rawUser);
          const userRol = Number(userData.rol ?? userData.id_rol);

          if (Number.isFinite(userRol)) {
            if (!cancelled) {
              setRol(userRol);
              setPlantaDelUsuario(userRol !== 1 ? userData.id_planta ?? null : null);
              setError('');
              setSessionReady(true);
            }
            return;
          }
        }

        const token = localStorage.getItem('token');
        if (!token) {
          if (!cancelled) {
            setError('Sesión no encontrada. Volvé a iniciar sesión.');
            setSessionReady(true);
            setLoading(false);
          }
          return;
        }

        const payload = decodeJwtPayload(token);
        const tokenRol = Number(payload?.rol);

        if (!Number.isFinite(tokenRol)) {
          if (!cancelled) {
            setError('No se pudo validar la sesión. Iniciá sesión nuevamente.');
            setSessionReady(true);
            setLoading(false);
          }
          return;
        }

        let idPlanta = null;
        if (tokenRol !== 1) {
          const profileRes = await api.get('/usuarios/usuario-actual');
          idPlanta = profileRes.data?.id_planta ?? null;

          if (!idPlanta) {
            throw new Error('No se pudo determinar la planta del usuario');
          }
        }

        localStorage.setItem(
          'user',
          JSON.stringify({
            rol: tokenRol,
            id_planta: idPlanta,
          })
        );

        if (!cancelled) {
          setRol(tokenRol);
          setPlantaDelUsuario(idPlanta);
          setError('');
          setSessionReady(true);
        }
      } catch (err) {
        console.error('[FaenasRealizadasPage] Error al obtener usuario:', err);
        if (!cancelled) {
          setError('No se pudo cargar la sesión del usuario. Volvé a iniciar sesión.');
          setSessionReady(true);
          setLoading(false);
        }
      }
    };

    loadUserContext();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchFaenas = async () => {
    setLoading(true);
    try {
      if (rol !== 1 && !plantaDelUsuario) {
        setFaenas([]);
        setTotalFaenados(0);
        setCurrentPage(1);
        setError('No se pudo determinar la planta del usuario. Volvé a iniciar sesión.');
        return;
      }

      const params = {};
      const desde = filtro.desde?.trim();
      const hasta = filtro.hasta?.trim();

      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (filtro.n_tropa?.trim()) params.n_tropa = filtro.n_tropa.trim();
      if (rol !== 1 && plantaDelUsuario) {
        params.id_planta = String(plantaDelUsuario);
      }

      console.log('[FaenasRealizadasPage] Cargando con params:', params);

      const res = await api.get('/faena/faenas-realizadas', { params });
      console.log('[FaenasRealizadasPage] Respuesta recibida:', res.data);

      const data = res.data;
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.faenas)
        ? data.faenas
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setFaenas(arr);
      setTotalFaenados(Number(data?.total_faenados) || 0);
      setCurrentPage(1);
      setError('');
    } catch (err) {
      console.error('[FaenasRealizadasPage] Error al cargar faenas:', err?.response?.data || err.message);
      setFaenas([]);
      setTotalFaenados(0);
      setCurrentPage(1);
      setError('No se pudieron cargar las faenas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    if (rol === null) {
      setLoading(false);
      return;
    }

    fetchFaenas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, rol, plantaDelUsuario, sessionReady]);

  useEffect(() => setCurrentPage(1), [rowsPerPage, sortOrder]);

  // Función para formatear fecha evitando desfase de zona horaria
  const formatDate = (f) => {
    if (!f) return '—';
    try {
      // Si viene como string "YYYY-MM-DD", parsearlo directamente sin New Date (que lo interpreta como UTC)
      if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}/.test(f)) {
        const [year, month, day] = f.split('T')[0].split('-');
        const date = new Date(year, parseInt(month) - 1, day);
        return date.toLocaleDateString('es-AR');
      }
      return new Date(f).toLocaleDateString('es-AR');
    } catch (e) {
      return '—';
    }
  };

  const handleDecomisar = (id_faena) =>
    navigate(`/decomisos/nuevo/${id_faena}`);

  const sortedFaenas = useMemo(() => {
    const copy = Array.isArray(faenas) ? [...faenas] : [];
    copy.sort((a, b) => {
      const da = a?.fecha_faena ? new Date(a.fecha_faena).getTime() : -Infinity;
      const db = b?.fecha_faena ? new Date(b.fecha_faena).getTime() : -Infinity;
      const sval = sortOrder?.value ?? 'desc';
      return sval === 'desc' ? db - da : da - db;
    });
    return copy;
  }, [faenas, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedFaenas.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedFaenas = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedFaenas.slice(start, start + rowsPerPage);
  }, [sortedFaenas, currentPage, rowsPerPage]);

  const getPageButtons = () => {
    const maxButtons = 7;
    if (totalPages <= maxButtons)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages = new Set([1, totalPages]);
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
      if (i > 0 && page - prev > 1)
        elems.push(
          <span key={`ellipsis-${i}`} className="text-slate-500 px-2">
            …
          </span>
        );
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

  const plantaLabel = (f) => {
    if (!f) return '—';
    // Buscar en diferentes estructuras posibles
    if (f.nombre_planta) return f.nombre_planta;
    if (f.planta && typeof f.planta === 'object') {
      return f.planta.nombre ?? (f.planta.id ? `Planta #${f.planta.id}` : '—');
    }
    if (f.planta_nombre) return f.planta_nombre;
    if (f.planta) return f.planta;
    return '—';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 drop-shadow mb-6">
          Faenas Realizadas
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
                    setFiltro((s) => ({ ...s, desde: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 appearance-none"
                  style={{ minWidth: 0 }}
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
                    setFiltro((s) => ({ ...s, hasta: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 appearance-none"
                  style={{ minWidth: 0 }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  Buscar N° Tropa
                </label>
                <input
                  type="text"
                  placeholder="N° Tropa"
                  value={filtro.n_tropa}
                  onChange={(e) =>
                    setFiltro((s) => ({ ...s, n_tropa: e.target.value }))
                  }
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
                  style={{ minWidth: 0 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-3 items-end">
              <div style={{ minWidth: 0 }}>
                <SelectField
                  label="Orden"
                  value={sortOrder}
                  options={sortOptions}
                  onChange={(sel) => setSortOrder(sel)}
                  className={isMobile ? '' : 'w-86'}
                  placeholder="Seleccionar orden"
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <SelectField
                  label="Filas"
                  value={
                    rowsPerPageOptions.find((o) => o === rowsPerPage)
                      ? { value: rowsPerPage, label: String(rowsPerPage) }
                      : null
                  }
                  options={rowsPerPageOptions.map((v) => ({
                    value: v,
                    label: String(v),
                  }))}
                  onChange={(sel) =>
                    setRowsPerPage(Number(sel?.value ?? rowsPerPage))
                  }
                  className={isMobile ? '' : 'w-24'}
                  placeholder="Filas"
                />
              </div>

              <div className="flex flex-col items-start md:items-end">
                <div
                  className="text-sm text-slate-700"
                  style={{ fontSize: isMobile ? 12 : 14 }}
                >
                  <span className="font-medium">{faenas.length}</span>
                  <span className="ml-1 text-slate-500">registro(s)</span>
                </div>

                <div className="mt-2 md:mt-1 text-sm text-slate-700">
                  <span className="font-medium">Total faenados:</span>{' '}
                  <span className="font-bold text-green-700">
                    {totalFaenados}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="text-center mt-10 max-w-xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-5">
          <p className="text-lg font-semibold">No se pudo cargar la página</p>
          <p className="mt-2">{error}</p>
        </div>
      ) : paginatedFaenas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-lg">No se encontraron faenas.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block flex justify-center">
            <div
              className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <table className="w-full text-xs text-center text-slate-700">
                <thead className="bg-green-700 text-white uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2">DTE/DTU</th>
                    <th className="px-2 py-2">Planta</th>
                    <th className="px-2 py-2">Guía</th>
                    <th className="px-2 py-2">Nº Tropa</th>
                    <th className="px-2 py-2">Productor</th>
                    <th className="px-2 py-2">Depto.</th>
                    <th className="px-2 py-2">Titular</th>
                    <th className="px-2 py-2">Especie</th>
                    <th className="px-2 py-2">Faenado</th>
                    <th className="px-2 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFaenas.map((f) => (
                    <tr
                      key={f.id_faena}
                      className="border-b last:border-b-0 transition-colors bg-white hover:bg-green-50"
                    >
                      <td className="px-2 py-2 text-[12px]">
                        {formatDate(f.fecha_faena)}
                      </td>
                      <td className="px-2 py-2 text-[12px]">{f.dte_dtu || '—'}</td>
                      <td className="px-2 py-2 text-[12px]">{plantaLabel(f)}</td>
                      <td className="px-2 py-2 text-[12px] truncate">{f.guia_policial || '—'}</td>
                      <td className="px-2 py-2 text-[12px] font-semibold text-green-800">
                        {f.n_tropa}
                      </td>
                      <td className="px-2 py-2 text-[12px] max-w-[80px] truncate">{f.productor}</td>
                      <td className="px-2 py-2 text-[12px] max-w-[60px] truncate">{f.departamento}</td>
                      <td className="px-2 py-2 text-[12px] max-w-[80px] truncate">{f.titular_faena}</td>
                      <td className="px-2 py-2 text-[12px]">{f.especie}</td>
                      <td className="px-2 py-2 text-[12px] font-bold">{f.total_faenado}</td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => handleDecomisar(f.id_faena)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold transition whitespace-nowrap"
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
                    <span className="font-medium">Planta:</span>{' '}
                    {plantaLabel(f)}
                  </div>
                  <div>
                    <span className="font-medium">Guía:</span>{' '}
                    {f.guia_policial || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Productor:</span>{' '}
                    {f.productor || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Departamento:</span>{' '}
                    {f.departamento || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Titular:</span>{' '}
                    {f.titular_faena || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Especie:</span>{' '}
                    {f.especie || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Faenado:</span>{' '}
                    {f.total_faenado ?? '—'}
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

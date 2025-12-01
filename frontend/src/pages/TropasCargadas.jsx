// TropasCargadas.jsx — Paginación replicada desde FaenaPage (primeras 3 páginas, “…” y última)
// Mantiene filtros, tabla/cards y SelectField con apariencia consistente

import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api.js';

const INPUT_BASE_CLASS =
  'w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 ' +
  'focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50';

function SelectField({
  value,
  onChange,
  options = [],
  placeholder = '',
  isDisabled = false,
  className = '',
  maxMenuHeight = 200,
}) {
  const [isFocusing, setIsFocusing] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      minHeight: '48px',
      paddingLeft: '16px',
      paddingRight: '16px',
      backgroundColor: isDisabled ? '#f3f4f6' : '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: isFocusing
        ? '0 0 0 1px #000'
        : state.isFocused
        ? '0 0 0 4px #d1fae5'
        : 'none',
      transition: 'all 50ms ease',
      display: 'flex',
      alignItems: 'center',
      cursor: isDisabled ? 'not-allowed' : 'default',
      opacity: isDisabled ? 0.85 : 1,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 0 0 2px',
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
      top: 'initial',
      transform: 'none',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '48px',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      fontSize: '14px',
      padding: '10px 16px',
      backgroundColor: isFocused ? '#d1fae5' : '#fff',
      color: isFocused ? '#065f46' : '#111827',
      cursor: 'pointer',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  return (
    <div className={className}>
      <Select
        value={value ?? null}
        onChange={(sel) => onChange(sel ?? null)}
        options={options}
        placeholder={placeholder}
        maxMenuHeight={maxMenuHeight}
        styles={customStyles}
        noOptionsMessage={() => 'Sin opciones'}
        components={{ IndicatorSeparator: () => null }}
        isDisabled={isDisabled}
        onFocus={() => {
          if (!isDisabled) {
            setIsFocusing(true);
            setTimeout(() => setIsFocusing(false), 50);
          }
        }}
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : undefined
        }
        menuPosition="fixed"
      />
    </div>
  );
}

export default function TropasCargadas() {
  const [allTropas, setAllTropas] = useState([]);
  const [tropas, setTropas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(7);
  const [usuario, setUsuario] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const pageSizeOptions = useMemo(
    () => [
      { value: 4, label: '4' },
      { value: 7, label: '7' },
      { value: 10, label: '10' },
      { value: 20, label: '20' },
    ],
    []
  );
  const selectedPageSizeOption =
    pageSizeOptions.find((o) => o.value === pageSize) || null;

  useEffect(() => {
    let canceled = false;
    setLoading(true);

    api
      .get('/usuarios/usuario-actual')
      .then((resU) => {
        if (canceled) return;
        const u = resU.data ?? null;
        setUsuario(u);

        const idPlanta =
          u?.id_planta ??
          u?.planta?.id_planta ??
          u?.planta?.id ??
          (u && (u.idPlanta || u.plantaId)) ??
          null;

        if (idPlanta != null) {
          return api
            .get(`/tropas?planta=${encodeURIComponent(idPlanta)}`)
            .then((resT) => ({
              tropas: Array.isArray(resT.data) ? resT.data : [],
              idPlanta,
            }))
            .catch(() => ({ tropas: [], idPlanta }));
        }

        return api
          .get('/tropas')
          .then((resT) => ({
            tropas: Array.isArray(resT.data) ? resT.data : [],
            idPlanta: null,
          }))
          .catch(() => ({ tropas: [], idPlanta: null }));
      })
      .then(({ tropas: tropasResp, idPlanta }) => {
        if (canceled) return;
        let arr = tropasResp.slice();

        if (idPlanta != null && tropasResp.length > 0) {
          arr = arr.filter((t) => {
            const tPlanta =
              t?.id_planta ??
              t?.planta_id ??
              t?.planta?.id_planta ??
              t?.planta?.id ??
              null;
            if (tPlanta == null) return false;
            return String(tPlanta) === String(idPlanta);
          });
        }

        const ordenadas = arr.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setAllTropas(ordenadas);
      })
      .catch((err) => {
        console.error('Error al obtener usuario/tropas:', err);
        if (!canceled) setError('Error al obtener tropas');
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, []);

  const applyFilters = () => {
    const term = String(query || '')
      .trim()
      .toLowerCase();
    const isNum = /^\d+$/.test(term);
    let filtered = allTropas.slice();

    if (usuario && usuario.id_planta != null) {
      filtered = filtered.filter((t) => {
        const tPlanta =
          t.id_planta ??
          t.planta_id ??
          (t.planta && (t.planta.id_planta ?? t.planta.id)) ??
          null;
        if (tPlanta == null) return false;
        return String(tPlanta) === String(usuario.id_planta);
      });
    }

    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter((t) => {
        if (!t.fecha) return false;
        const d = new Date(t.fecha);
        return d.setHours(0, 0, 0, 0) >= new Date(s).setHours(0, 0, 0, 0);
      });
    }
    if (endDate) {
      const e = new Date(endDate);
      filtered = filtered.filter((t) => {
        if (!t.fecha) return false;
        const d = new Date(t.fecha);
        return d.setHours(0, 0, 0, 0) <= new Date(e).setHours(0, 0, 0, 0);
      });
    }

    if (term) {
      filtered = filtered.filter((t) => {
        if (isNum && t.n_tropa != null)
          return String(t.n_tropa).startsWith(term);
        if (t.dte_dtu && String(t.dte_dtu).toLowerCase().includes(term))
          return true;
        const prod = (t.productor_nombre || t.productor || '')
          .toString()
          .toLowerCase();
        return prod.includes(term);
      });
    }

    const ordenadas = filtered.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    setTropas(ordenadas);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(applyFilters, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [startDate, endDate, query, allTropas, usuario]);

  const clearStartDate = () => startDate && setStartDate('');
  const clearEndDate = () => endDate && setEndDate('');
  const clearQuery = () => query && setQuery('');

  const rangeInvalid = useMemo(() => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) > new Date(endDate);
  }, [startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(tropas.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, startDate, endDate, query, tropas.length]);

  const paginatedTropas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tropas.slice(start, start + pageSize);
  }, [tropas, currentPage, pageSize]);

  const RowActions = ({ tropa }) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          navigate(`/tropas-cargadas/modificar/${tropa.id_tropa}`);
        }}
        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm"
      >
        ✏️ Modificar
      </button>
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          navigate(`/tropas-cargadas/resumen/${tropa.id_tropa}`);
        }}
        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm"
      >
        📄 Resumen
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 px-3 sm:px-4 lg:px-6 box-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
            📋 Tropas Cargadas
          </h1>
        </div>

        {/* FILTROS */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex gap-3 w-full sm:w-auto flex-wrap">
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                Desde
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={INPUT_BASE_CLASS}
                />
                {startDate && (
                  <button
                    type="button"
                    onClick={clearStartDate}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                    title="Limpiar fecha desde"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                Hasta
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={INPUT_BASE_CLASS}
                />
                {endDate && (
                  <button
                    type="button"
                    onClick={clearEndDate}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                    title="Limpiar fecha hasta"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {rangeInvalid && (
              <div className="text-xs sm:text-sm text-red-600 self-center">
                Rango inválido
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-1/2 items-start">
            <div className="flex-1 w-full">
              <label className="block text-xs sm:text-sm text-gray-600 mb-1">
                Buscar por N° Tropa / DTE / productor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  placeholder="Ej: 123 / 2023-ABC / Pérez"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`w-full sm:w-2/3 ${INPUT_BASE_CLASS}`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                    title="Limpiar búsqueda"
                  >
                    Limpiar
                  </button>
                )}

                <div className="w-32 sm:w-40">
                  <label className="sr-only">Cant. filas</label>
                  <SelectField
                    value={selectedPageSizeOption}
                    onChange={(sel) => {
                      const next = sel ? Number(sel.value) : pageSize;
                      setPageSize(next);
                    }}
                    options={pageSizeOptions}
                    placeholder="Cant. filas"
                    className=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-6 text-gray-500">
            Cargando tropas...
          </div>
        )}
        {error && <div className="text-center py-4 text-red-600">{error}</div>}

        {!loading && paginatedTropas.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full mb-3">
              <span className="text-xl">🐄</span>
            </div>
            <p className="text-gray-500 text-sm sm:text-lg">
              No hay tropas registradas para tu planta
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Ajustá los filtros para ampliar la búsqueda
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="hidden sm:block">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
                <table
                  style={{ minWidth: 0, width: '100%' }}
                  className="min-w-full text-xs sm:text-sm text-gray-700"
                >
                  <thead className="bg-green-700 text-white uppercase tracking-wide text-[10px] sm:text-xs">
                    <tr>
                      <th className="px-2 sm:px-3 py-2 text-left">#</th>
                      <th className="px-2 sm:px-3 py-2 text-left">N° Tropa</th>
                      <th className="px-2 sm:px-3 py-2 text-left">Fecha</th>
                      <th className="px-2 sm:px-3 py-2 text-left">Productor</th>
                      <th className="px-2 sm:px-3 py-2 text-left">Titular</th>
                      <th className="px-2 sm:px-3 py-2 text-left">DTE/DTU</th>
                      <th className="px-2 sm:px-3 py-2 text-center">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedTropas.map((tropa, i) => (
                      <tr
                        key={tropa.id_tropa}
                        className="hover:bg-green-50 transition"
                      >
                        <td className="px-2 sm:px-3 py-2">
                          {(currentPage - 1) * pageSize + (i + 1)}
                        </td>
                        <td className="px-2 sm:px-3 py-2 font-semibold text-green-700">
                          {tropa.n_tropa}
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          {tropa.fecha
                            ? new Date(tropa.fecha).toLocaleDateString('es-AR')
                            : '—'}
                        </td>
                        <td className="px-2 sm:px-3 py-2 truncate max-w-xs break-words">
                          {tropa.productor_nombre || tropa.productor || '—'}
                        </td>
                        <td className="px-2 sm:px-3 py-2 truncate max-w-xs break-words">
                          {tropa.titular || '—'}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-[11px] sm:text-sm text-gray-700 break-words">
                          {tropa.dte_dtu || '—'}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center">
                          <RowActions tropa={tropa} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: cards */}
            <div className="block sm:hidden">
              <div
                className="space-y-3 px-0"
                style={{ boxSizing: 'border-box', maxWidth: '100%' }}
              >
                {paginatedTropas.map((tropa) => (
                  <div
                    key={tropa.id_tropa}
                    className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-2 text-xs border border-gray-100 hover:border-green-200 max-w-full box-border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-green-700 text-sm">
                          {tropa.n_tropa}
                        </span>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
                          {tropa.fecha
                            ? new Date(tropa.fecha).toLocaleDateString('es-AR')
                            : '—'}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full transition-colors" />
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex items-start space-x-1">
                        <span className="text-gray-400 text-[11px] mt-0.5">
                          👤
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-[11px] truncate">
                            Titular
                          </p>
                          <p className="text-gray-700 font-medium text-[11px] truncate">
                            {tropa.titular || '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-1">
                        <span className="text-gray-400 text-[11px] mt-0.5">
                          🏠
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-[11px]">
                            Productor
                          </p>
                          <p className="text-gray-600 text-[11px] truncate">
                            {tropa.productor_nombre || tropa.productor || '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-1">
                        <span className="text-gray-400 text-[11px] mt-0.5">
                          📄
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-[11px]">
                            DTE/DTU
                          </p>
                          <p className="text-gray-600 text-[11px] truncate">
                            {tropa.dte_dtu || '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <RowActions tropa={tropa} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paginación replicada de FaenaPage */}
            {tropas.length > pageSize && (
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
    </div>
  );
}

// TropasCargadas.jsx (filtrado solo en frontend)
import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function TropasCargadas() {
  const [allTropas, setAllTropas] = useState([]); // lista sin filtrar
  const [tropas, setTropas] = useState([]); // lista filtrada (mostrada)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [query, setQuery] = useState('');

  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Cargar tropas una sola vez
  useEffect(() => {
    let canceled = false;
    setLoading(true);
    api
      .get('/tropas')
      .then((res) => {
        if (canceled) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        // ordenar por fecha desc
        const ordenadas = arr
          .slice()
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setAllTropas(ordenadas);
        // inicialmente mostrar hasta 6 (como antes)
        setTropas(ordenadas.slice(0, 6));
      })
      .catch((err) => {
        console.error('Error al obtener tropas:', err);
        if (!canceled) setError('Error al obtener tropas');
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, []);

  // Función que aplica filtros en memoria
  const applyFilters = () => {
    const term = String(query || '')
      .trim()
      .toLowerCase();
    const isNum = /^\d+$/.test(term);

    let filtered = allTropas.slice();

    // Filtrar por rango de fechas si están provistas
    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter((t) => {
        if (!t.fecha) return false;
        const d = new Date(t.fecha);
        // comparar por día (ignorar hora)
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

    // Filtrar por query: n_tropa exacto si es numérico; si no, dte_dtu parcial o productor parcial
    if (term) {
      filtered = filtered.filter((t) => {
        // n_tropa exact match (si term es numérico)
        if (isNum && t.n_tropa !== undefined && t.n_tropa !== null) {
          if (String(t.n_tropa) === term) return true;
        }
        // dte_dtu partial match
        if (t.dte_dtu && String(t.dte_dtu).toLowerCase().includes(term))
          return true;
        // productor partial match (puede venir como productor_nombre o productor)
        const prod = (t.productor_nombre || t.productor || '')
          .toString()
          .toLowerCase();
        if (prod.includes(term)) return true;
        return false;
      });
    }

    // ordenar por fecha desc y tomar hasta 6
    const ordenadas = filtered.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    setTropas(ordenadas.slice(0, 6));
  };

  // Debounce: aplicar filtros cuando cambian los inputs
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, query, allTropas]);

  // Limpiar filtros
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setQuery('');
    // restaurar primeras 6
    setTropas(allTropas.slice(0, 6));
  };

  // optional: memoized UI state to show range validity
  const rangeInvalid = useMemo(() => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) > new Date(endDate);
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            📋 Tropas Cargadas
          </h1>
          <p className="text-gray-500 text-sm">
            Filtrá por rango de fecha o por N° Tropa, DTE/DTU o Productor
          </p>
        </div>

        {/* filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <label className="text-sm text-gray-600">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 bg-white text-sm"
            />
            <label className="text-sm text-gray-600">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 bg-white text-sm"
            />
            {rangeInvalid && (
              <div className="text-sm text-red-600 ml-2">Rango inválido</div>
            )}
          </div>

          <div className="flex gap-2 items-center w-full sm:w-1/2">
            <input
              type="search"
              placeholder="Buscar por nro. tropa, DTE o productor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border rounded px-3 py-2 bg-white text-sm"
            />
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm"
              type="button"
            >
              Limpiar
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-6 text-gray-500">
            Cargando tropas...
          </div>
        )}

        {error && <div className="text-center py-4 text-red-600">{error}</div>}

        {!loading && tropas.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full mb-3">
              <span className="text-xl">🐄</span>
            </div>
            <p className="text-gray-500 text-lg">No hay tropas registradas</p>
            <p className="text-gray-400 text-sm mt-1">
              Ajustá los filtros para ampliar la búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tropas.map((tropa) => (
              <div
                key={tropa.id_tropa}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 hover:border-green-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-green-700">
                      #{tropa.n_tropa}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {tropa.fecha
                        ? new Date(tropa.fecha).toLocaleDateString('es-AR')
                        : '—'}
                    </span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full group-hover:bg-green-500 transition-colors" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-0.5">👤</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        Titular
                      </p>
                      <p className="text-gray-700 font-medium text-sm truncate">
                        {tropa.titular || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-0.5">🏭</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        Productor
                      </p>
                      <p className="text-gray-600 text-sm truncate">
                        {tropa.productor_nombre || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-0.5">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        DTE/DTU
                      </p>
                      <p className="text-gray-600 font-mono text-xs truncate">
                        {tropa.dte_dtu}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/modificar/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                  >
                    <span className="text-sm">✏️</span>
                    <span className="text-sm">Modificar</span>
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/resumen/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                  >
                    <span className="text-sm">📄</span>
                    <span className="text-sm">Resumen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Mostrando las últimas 6 tropas (filtradas)
          </p>
        </div>
      </div>
    </div>
  );
}

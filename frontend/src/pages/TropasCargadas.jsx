// TropasCargadas.jsx (con pageSize y filtrado por planta del usuario)
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
  const [pageSize, setPageSize] = useState(7); // default según tu ejemplo
  const [usuario, setUsuario] = useState(null); // usuario actual (para id_planta)

  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Cargar tropas + usuario actual una sola vez
  useEffect(() => {
    let canceled = false;
    setLoading(true);

    const pTropas = api.get('/tropas').catch((e) => ({ data: [] }));
    const pUsuario = api
      .get('/usuarios/usuario-actual')
      .catch(() => ({ data: null }));

    Promise.all([pTropas, pUsuario])
      .then(([resT, resU]) => {
        if (canceled) return;
        const arr = Array.isArray(resT.data) ? resT.data : [];
        const ordenadas = arr
          .slice()
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setAllTropas(ordenadas);
        setTropas(ordenadas.slice(0, pageSize));
        setUsuario(resU.data ?? null);
      })
      .catch((err) => {
        console.error('Error al obtener tropas o usuario:', err);
        if (!canceled) setError('Error al obtener tropas');
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplica filtros en memoria y además filtra por planta del usuario (si existe)
  const applyFilters = () => {
    const term = String(query || '')
      .trim()
      .toLowerCase();
    const isNum = /^\d+$/.test(term);

    let filtered = allTropas.slice();

    // 1) Filtrar por planta del usuario (si tenemos usuario con id_planta)
    if (
      usuario &&
      usuario.id_planta !== undefined &&
      usuario.id_planta !== null
    ) {
      filtered = filtered.filter((t) => {
        // varios nombres posibles para campo planta en los objetos que tienes en backend:
        // t.id_planta, t.planta_id, t.planta?.id_planta, t.planta_nombre etc.
        // comprobamos las variantes más probables:
        const tPlanta =
          t.id_planta ??
          t.planta_id ??
          (t.planta && (t.planta.id_planta ?? t.planta.id)) ??
          null;
        if (tPlanta == null) return false;
        return String(tPlanta) === String(usuario.id_planta);
      });
    }

    // 2) Filtrar por rango de fechas
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

    // 3) Filtrar por query (n_tropa exacto si es numérico; dte_dtu o productor parcial)
    if (term) {
      filtered = filtered.filter((t) => {
        if (isNum && t.n_tropa !== undefined && t.n_tropa !== null) {
          if (String(t.n_tropa) === term) return true;
        }
        if (t.dte_dtu && String(t.dte_dtu).toLowerCase().includes(term))
          return true;
        const prod = (t.productor_nombre || t.productor || '')
          .toString()
          .toLowerCase();
        if (prod.includes(term)) return true;
        return false;
      });
    }

    // ordenar por fecha desc y tomar según pageSize
    const ordenadas = filtered.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    setTropas(ordenadas.slice(0, Number(pageSize)));
  };

  // Debounce: aplicar filtros cuando cambian inputs o pageSize o usuario
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters();
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, query, allTropas, pageSize, usuario]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setQuery('');
    setTropas(allTropas.slice(0, pageSize));
  };

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
            Filtrá por rango de fecha, N° Tropa, DTE/DTU o Productor. Se
            muestran solo las tropas de la planta asignada al usuario.
          </p>
        </div>

        {/* filtros + pageSize */}
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
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-3 py-2 bg-white text-sm"
            >
              <option value={4}>Mostrar 4</option>
              <option value={7}>Mostrar 7</option>
              <option value={10}>Mostrar 10</option>
              <option value={20}>Mostrar 20</option>
            </select>
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
            <p className="text-gray-500 text-lg">
              No hay tropas registradas para tu planta
            </p>
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
                    <span className="text-gray-400 text-sm mt-0.5">🏠</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        Productor
                      </p>
                      <p className="text-gray-600 text-sm truncate">
                        {tropa.productor_nombre || tropa.productor || '—'}
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
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 text-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/resumen/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 text-sm"
                  >
                    📄 Resumen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Mostrando las últimas {pageSize} tropas (filtradas)
          </p>
        </div>
      </div>
    </div>
  );
}

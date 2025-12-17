import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import api from '../services/api';

// Página Informe de Faena — ahora con datos dinámicos y filtros
export default function InformeFaenaPage() {
  const navigate = useNavigate();

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [idEspecie, setIdEspecie] = useState('');
  const [idProvincia, setIdProvincia] = useState('');
  const [idPlanta, setIdPlanta] = useState('');

  const [especies, setEspecies] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [plantas, setPlantas] = useState([]);

  const [faenas, setFaenas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // cargar especies, provincias y plantas al montar
    let mounted = true;
    (async () => {
      try {
        const [espRes, provRes, plantRes] = await Promise.all([
          api.get('/especies'),
          api.get('/provincias'),
          api.get('/plantas'),
        ]);
        if (!mounted) return;
        setEspecies(espRes.data || []);
        setProvincias(provRes.data || []);
        setPlantas(plantRes.data || []);
      } catch (err) {
        // no bloquear la UI; mostrar vacío si falla
        console.error('Error cargando filtros:', err);
      }
    })();
    return () => (mounted = false);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (idEspecie) params.id_especie = idEspecie;
      if (idProvincia) params.id_provincia = idProvincia;
      if (idPlanta) params.id_planta = idPlanta;

      const res = await api.get('/faena/faenas-realizadas', { params });
      // respuesta: { faenas, total_faenados }
      const payload = res.data?.faenas ?? res.data ?? [];
      setFaenas(payload);
    } catch (err) {
      console.error(
        'Error al obtener faenas realizadas:',
        err?.response ?? err.message
      );
      setFaenas([]);
    } finally {
      setLoading(false);
    }
  };

  // cargar datos iniciales sin filtros
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Totales calculados a partir de faenas
  const totals = useMemo(() => {
    const total = faenas.length;
    const byEstado = faenas.reduce((acc, f) => {
      const est = (f.estado || f.estado_faena || 'finalizada').toString();
      acc[est] = (acc[est] || 0) + 1;
      return acc;
    }, {});
    const byPlanta = faenas.reduce((acc, f) => {
      const planta = f.nombre_planta || `Planta ${f.id_planta || ''}`;
      acc[planta] = (acc[planta] || 0) + 1;
      return acc;
    }, {});

    return { total, byEstado, byPlanta };
  }, [faenas]);

  const estadosOrden = ['pendiente', 'en proceso', 'finalizada'];

  // datos de tendencia (construidos a partir de faenas - simple agrupación por mes)
  const tendencia = useMemo(() => {
    const map = {};
    faenas.forEach((f) => {
      const d = new Date(f.fecha_faena || f.fecha || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      map[key] = (map[key] || 0) + 1;
    });
    const entries = Object.entries(map).sort();
    return {
      meses: entries.map((e) => e[0]),
      valores: entries.map((e) => e[1]),
    };
  }, [faenas]);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header con título principal */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            📊 Informe de Faena
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Resumen operativo y tendencias</p>
        </div>

        {/* Barra de navegación y filtros */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
          <button
            onClick={() => navigate('/informes')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 shadow-sm"
            aria-label="Volver a informes"
          >
            <HiArrowLeft size={20} />
          </button>

          {/* Filtros rápidos */}
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 lg:flex-nowrap lg:flex-1 lg:justify-end">
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              aria-label="Desde"
            />
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              aria-label="Hasta"
            />

            <select
              value={idEspecie}
              onChange={(e) => setIdEspecie(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              aria-label="Especie"
            >
              <option value="">Todas las especies</option>
              {especies.map((s) => (
                <option key={s.id_especie} value={s.id_especie}>
                  {s.descripcion}
                </option>
              ))}
            </select>

            <select
              value={idProvincia}
              onChange={(e) => setIdProvincia(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              aria-label="Provincia"
            >
              <option value="">Todas las provincias</option>
              {provincias.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descripcion}
                </option>
              ))}
            </select>

            <select
              value={idPlanta}
              onChange={(e) => setIdPlanta(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              aria-label="Planta"
            >
              <option value="">Todas las plantas</option>
              {plantas.map((p) => (
                <option key={p.id_planta} value={p.id_planta}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm w-full sm:w-auto"
            >
              {loading ? 'Cargando...' : 'Aplicar'}
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
          {/* Top summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-600 text-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide">Total faenas</div>
              <div className="text-2xl font-bold mt-1">{totals.total}</div>
            </div>

            {estadosOrden.map((e) => (
              <div key={e} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="text-xs font-medium text-gray-600 capitalize">
                  {e.replace('-', ' ')}
                </div>
                <div className="text-xl font-semibold mt-1 text-gray-900">
                  {totals.byEstado[e] || 0}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Distribución por estado (simple bar) */}
            <div className="col-span-1 lg:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-base font-semibold mb-3 text-gray-900">
                Distribución por estado
              </h3>
              <div className="space-y-2">
                {estadosOrden.map((estado) => {
                  const count = totals.byEstado[estado] || 0;
                  const pct = totals.total
                    ? Math.round((count / totals.total) * 100)
                    : 0;
                  return (
                    <div key={estado} className="flex items-center gap-3">
                      <div className="w-24 text-xs capitalize text-gray-700 font-medium">
                        {estado}
                      </div>
                      <div className="flex-1 bg-white rounded-full h-3 overflow-hidden shadow-inner border">
                        <div
                          className="h-3 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-xs font-medium text-gray-600">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tendencias (sparkline simple) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-base font-semibold mb-3 text-gray-900">Tendencia mensual</h3>
              <div className="w-full h-20 flex items-center justify-center">
                <svg
                  width="100%"
                  height="50"
                  viewBox="0 0 200 50"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={
                      tendencia.valores.length
                        ? tendencia.valores
                            .map(
                              (v, i) =>
                                `${(i / (tendencia.valores.length - 1)) * 180 + 10},${
                                  40 - (v / Math.max(...tendencia.valores)) * 30
                                }`
                            )
                            .join(' ')
                        : '10,40 190,40'
                    }
                  />
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                {tendencia.meses.slice(0, 3).map((m) => (
                  <div key={m}>{m}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla por planta */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-semibold mb-3 text-gray-900">Faenas por planta</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide">
                    <th className="py-2 pr-4">Planta</th>
                    <th className="py-2 pr-4">Cantidad</th>
                    <th className="py-2 pr-4">% del total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {Object.entries(totals.byPlanta).map(([planta, cnt]) => (
                    <tr key={planta} className="border-t border-gray-200">
                      <td className="py-2 pr-4 font-medium">{planta}</td>
                      <td className="py-2 pr-4">{cnt}</td>
                      <td className="py-2 pr-4">
                        {Math.round((cnt / totals.total) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota explicativa */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Este informe ofrece una visión rápida del desempeño operativo.
              Los datos se actualizan según los filtros aplicados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

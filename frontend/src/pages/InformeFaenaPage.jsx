import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

  const [user, setUser] = useState(null);

  const [period, setPeriod] = useState('6'); // meses

  const [faenas, setFaenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalTropas, setTotalTropas] = useState(0);
  const [tropasFaenadasCompletas, setTropasFaenadasCompletas] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [totalFaenados, setTotalFaenados] = useState(0);
  const [totalPorTropa, setTotalPorTropa] = useState({});

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

        let plantasData = plantRes.data || [];

        // Handle user permissions
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setUser(user);
            if (user.role !== 1 && user.id_planta) {
              // Non-admin: auto-select their plant
              setIdPlanta(user.id_planta.toString());
            }
            // For non-admin, we could filter plantasData to only their plant, but since the select will be hidden, it's optional
          }
        } catch (e) {
          console.error('Error obteniendo usuario:', e);
        }

        setEspecies(espRes.data || []);
        setProvincias(provRes.data || []);
        setPlantas(plantasData);
        setInitialLoad(false);
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
      // respuesta: { faenas, total_faenados, total_tropas, tropas_faenadas_completas, total_unidades }
      const payload = res.data?.faenas ?? res.data ?? [];
      const totalFaenados = res.data?.total_faenados ?? 0;
      const totalTropasRes = res.data?.total_tropas ?? 0;
      const tropasFaenadasCompletasRes =
        res.data?.tropas_faenadas_completas ?? 0;
      const totalUnidadesRes = res.data?.total_unidades ?? 0;
      const totalPorTropaRes = res.data?.total_por_tropa ?? {};
      setFaenas(payload);
      setTotalFaenados(totalFaenados);
      setTotalTropas(totalTropasRes);
      setTropasFaenadasCompletas(tropasFaenadasCompletasRes);
      setTotalUnidades(totalUnidadesRes);
      setTotalPorTropa(totalPorTropaRes);
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

  // cargar datos iniciales
  useEffect(() => {
    if (initialLoad) return;
    fetchData();
  }, [desde, hasta, idEspecie, idProvincia, idPlanta, initialLoad]);

  const estadosOrden = ['pendiente', 'finalizada'];

  // Totales calculados a partir de faenas
  const totals = useMemo(() => {
    const total = faenas.length;

    // Calcular sum_faenado por tropa
    const sumFaenadoByTropa = faenas.reduce((acc, f) => {
      acc[f.tropa_id] = (acc[f.tropa_id] || 0) + Number(f.total_faenado || 0);
      return acc;
    }, {});

    const byEstadoAnimales = {
      finalizada: totalFaenados,
      pendiente: totalUnidades - totalFaenados,
    };

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

    return { total, byEstado, byEstadoAnimales, byPlanta };
  }, [faenas, totalPorTropa]);

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
    const numMonths = period === 'all' ? entries.length : parseInt(period);
    const filteredEntries = entries.slice(-numMonths);
    return {
      data: filteredEntries.map(([mes, valor]) => ({ mes, valor })),
    };
  }, [faenas, period]);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header con título principal */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            📊 Informe de Faena
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Resumen operativo y tendencias
          </p>
        </div>

        {/* Barra de navegación y filtros - NO IMPRIMIR */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4 no-print">
          <button
            onClick={() => navigate('/informes')}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 shadow-sm"
            aria-label="Volver a informes"
          >
            <HiArrowLeft size={20} />
          </button>

          {/* Filtros principales */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:flex-1 lg:justify-center">
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Desde"
              />
              <span className="text-xs text-gray-500">a</span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Hasta"
              />
            </div>

            <select
              value={idEspecie}
              onChange={(e) => setIdEspecie(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Especie"
            >
              <option value="">Especie</option>
              {especies.map((s) => (
                <option key={s.id_especie} value={s.id_especie}>
                  {s.descripcion}
                </option>
              ))}
            </select>

            <select
              value={idProvincia}
              onChange={(e) => setIdProvincia(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Provincia"
            >
              <option value="">Provincia</option>
              {provincias.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descripcion}
                </option>
              ))}
            </select>

            {user && user.role === 1 && (
              <select
                value={idPlanta}
                onChange={(e) => setIdPlanta(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Planta"
              >
                <option value="">Planta</option>
                {plantas.map((p) => (
                  <option key={p.id_planta} value={p.id_planta}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={fetchData}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
            >
              {loading ? '...' : 'Filtrar'}
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
          {/* Botón de impresión */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-green-200 flex flex-col sm:flex-row justify-end items-end gap-2 sm:gap-3 md:gap-4 no-print mb-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 text-xs sm:text-sm print:hidden whitespace-nowrap"
              title="Imprimir informe"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimir
            </button>
          </div>

          {/* Top summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-green-600 text-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide">
                Total tropas
              </div>
              <div className="text-2xl font-bold mt-1">{totalTropas}</div>
            </div>

            <div className="bg-green-600 text-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide">
                Cantidad animales tropa
              </div>
              <div className="text-2xl font-bold mt-1">{totalUnidades}</div>
            </div>

            <div className="bg-green-600 text-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide">
                Total tropas faenadas
              </div>
              <div className="text-2xl font-bold mt-1">
                {tropasFaenadasCompletas}
              </div>
            </div>

            <div className="bg-green-600 text-white rounded-lg p-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide">
                Total animales faenados
              </div>
              <div className="text-2xl font-bold mt-1">{totalFaenados}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Distribución por estado (simple bar) */}
            <div className="col-span-1 lg:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-base font-semibold mb-3 text-gray-900">
                Distribución por estado de animales
              </h3>
              <div className="space-y-2">
                {estadosOrden.map((estado) => {
                  const distribucionData = totals.byEstadoAnimales;
                  const count = distribucionData[estado] || 0;
                  const totalForPct = Object.values(
                    totals.byEstadoAnimales
                  ).reduce((a, b) => a + b, 0);
                  const pct = totalForPct
                    ? Math.round((count / totalForPct) * 100)
                    : 0;
                  return (
                    <div key={estado} className="flex items-center gap-3">
                      <div className="w-24 text-xs capitalize text-gray-700 font-medium">
                        {estado}
                      </div>
                      <div className="flex-1 bg-white rounded-full h-3 overflow-hidden shadow-inner border">
                        <div
                          className="h-3 rounded-full bg-green-500 transition-all duration-300"
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Tendencia mensual
                </h3>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  aria-label="Período"
                >
                  <option value="3">3M</option>
                  <option value="6">6M</option>
                  <option value="12">12M</option>
                  <option value="all">Todo</option>
                </select>
              </div>
              <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%" minHeight={128}>
                  <LineChart data={tendencia.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="mes"
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabla por planta */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-semibold mb-3 text-gray-900">
              Faenas por planta
            </h3>
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
              Este informe ofrece una visión rápida del desempeño operativo. Los
              datos se actualizan según los filtros aplicados.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
          padding: 0;
          margin-top: 0;
          margin-bottom: 0;
          margin-left: 0;
          margin-right: 0;
        }

        @media print {
          /* Ocultar elementos que no queremos en la impresión */
          .no-print {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Ocultar header y footer del navegador y aplicación */
          html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            color: #1f2937;
            height: auto !important;
            overflow: visible !important;
            width: 100% !important;
          }

          /* Ocultar elemento header y footer de la aplicación */
          header,
          nav,
          footer {
            display: none !important;
          }

          /* Contenedor principal */
          .bg-gray-50 {
            background-color: white !important;
            margin: 10mm 10mm 0 10mm !important;
            padding: 0 !important;
          }

          .max-w-6xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .bg-white {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Título principal con espacio */
          h1 {
            margin-top: 0 !important;
            margin-bottom: 10mm !important;
            page-break-after: avoid !important;
          }

          /* Tablas */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 8px;
          }

          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }

          /* Evitar saltos de página en elementos importantes */
          .bg-green-600 {
            page-break-inside: avoid;
          }

          /* Gráficos */
          svg {
            max-width: 100%;
          }

          /* Asegurar que el contenido fluya bien */
          * {
            page-break-inside: avoid;
          }

          /* Asegurar que no haya espacios en blanco */
          div[class*="max-w-6xl"] {
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

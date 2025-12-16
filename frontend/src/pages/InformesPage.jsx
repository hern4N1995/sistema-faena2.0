import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function InformesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());
  const [plantaSeleccionada, setPlantaSeleccionada] = useState('');
  const [plantas, setPlantas] = useState([]);
  const [dataByDay, setDataByDay] = useState({});
  const [enfermedades, setEnfermedades] = useState(new Set());
  const [rol, setRol] = useState(null);
  const [plantaDelUsuario, setPlantaDelUsuario] = useState(null);

  // Obtener rol y planta del usuario desde localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (userData) {
        const userRol = userData.id_rol || userData.rol;
        setRol(parseInt(userRol));
        
        // Usar id_planta del usuario (viene del backend)
        const plantaId = userData.id_planta;
        
        // Guardar la planta del usuario (solo si no es admin)
        if (parseInt(userRol) !== 1) {
          if (plantaId) {
            console.log('[InformesPage] Usuario no-admin con planta asignada:', plantaId);
            setPlantaDelUsuario(plantaId);
            setPlantaSeleccionada(plantaId);
          } else {
            console.warn('[InformesPage] Usuario no-admin pero sin planta asignada');
          }
        }
      }
    } catch (err) {
      console.error('[InformesPage] Error al obtener usuario:', err);
      setRol(null);
    }
  }, []);

  // Cargar plantas
  useEffect(() => {
    if (rol !== null && rol !== undefined) {
      loadPlantas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  // Cargar faenas y decomisos cuando cambien mes/año/planta
  useEffect(() => {
    if (rol !== null && rol !== undefined) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, año, plantaSeleccionada, rol]);

  const loadPlantas = async () => {
    try {
      console.log('[InformesPage] Cargando plantas...');
      const response = await api.get('/plantas');
      console.log('[InformesPage] Plantas cargadas:', response.data);
      setPlantas(response.data || []);
    } catch (err) {
      console.error('[InformesPage] Error cargando plantas:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener decomisos con detalles
      const decomisosRes = await api.get('/decomisos');
      let decomisosData = decomisosRes.data || [];

      console.log('[InformesPage] Decomisos crudos:', decomisosData);
      console.log('[InformesPage] Rol:', rol, 'Planta seleccionada:', plantaSeleccionada, 'Planta del usuario:', plantaDelUsuario);

      // Filtrar por mes, año y planta
      decomisosData = decomisosData.filter((d) => {
        try {
          const fecha = new Date(d.fecha_faena || d.fecha);
          if (isNaN(fecha.getTime())) return false;
          
          const esMesAño =
            fecha.getMonth() + 1 === parseInt(mes) &&
            fecha.getFullYear() === parseInt(año);
          
          if (!esMesAño) return false;

          // Si no es admin, filtrar solo por su planta
          if (rol !== 1) {
            // El usuario no-admin solo ve datos de su planta asignada
            return String(plantaDelUsuario) === String(d.id_planta);
          }

          // Si es admin y tiene plantaSeleccionada, filtrar por esa
          if (plantaSeleccionada && plantaSeleccionada !== '') {
            return String(plantaSeleccionada) === String(d.id_planta);
          }

          // Si es admin y no seleccionó planta, mostrar todas
          return true;
        } catch (err) {
          console.error('[InformesPage] Error filtrando fecha:', err);
          return false;
        }
      });

      console.log('[InformesPage] Decomisos después de filtro:', decomisosData);

      // Agrupar datos por día y construir estructura
      const grouped = {};
      const enfermedadesSet = new Set();

      decomisosData.forEach((d) => {
        try {
          const fecha = new Date(d.fecha_faena || d.fecha);
          const dia = String(fecha.getDate()).padStart(2, '0');

          if (!grouped[dia]) {
            grouped[dia] = {
              totalAnimales: 0,
              decomisos: {},
            };
          }

          // Sumar animales afectados (solo si hay detalles de decomiso)
          if (d.animales_afectados) {
            grouped[dia].totalAnimales += parseInt(d.animales_afectados) || 0;
          }

          // Log para debug: mostrar qué datos tenemos
          if (!d.afeccion || !d.nombre_tipo_parte) {
            console.log('[InformesPage] Decomiso sin datos completos:', {
              id_decomiso: d.id_decomiso,
              afeccion: d.afeccion,
              nombre_tipo_parte: d.nombre_tipo_parte,
              nombre_parte: d.nombre_parte,
              animales_afectados: d.animales_afectados,
            });
          }

          // Organizar decomisos por enfermedad y tipo de parte (solo si hay detalle)
          if (d.afeccion && d.nombre_tipo_parte && d.nombre_parte) {
            const enfermedad = d.afeccion || 'Sin especificar';
            const tipoParte = d.nombre_tipo_parte || 'Otro';
            const nombreParte = d.nombre_parte || 'Parte';
            const cantidad = parseInt(d.cantidad) || 1;

            enfermedadesSet.add(enfermedad);

            if (!grouped[dia].decomisos[enfermedad]) {
              grouped[dia].decomisos[enfermedad] = {};
            }

            if (!grouped[dia].decomisos[enfermedad][tipoParte]) {
              grouped[dia].decomisos[enfermedad][tipoParte] = {};
            }

            if (!grouped[dia].decomisos[enfermedad][tipoParte][nombreParte]) {
              grouped[dia].decomisos[enfermedad][tipoParte][nombreParte] = 0;
            }

            grouped[dia].decomisos[enfermedad][tipoParte][nombreParte] += cantidad;
          }
        } catch (err) {
          console.error('[InformesPage] Error procesando decomiso:', err, d);
        }
      });

      console.log('[InformesPage] Datos agrupados:', grouped);
      console.log('[InformesPage] Enfermedades encontradas:', Array.from(enfermedadesSet));

      setDataByDay(grouped);
      setEnfermedades(enfermedadesSet);
    } catch (err) {
      console.error('[InformesPage] Error cargando datos:', err);
      setError('No se pudieron cargar los datos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const getNombrePlanta = () => {
    if (rol === 1) {
      // Admin: mostrar nombre de la planta seleccionada o "Todas"
      if (!plantaSeleccionada || plantaSeleccionada === '') {
        return 'Todas las plantas';
      }
      const p = plantas.find((pl) => String(pl.id_planta) === String(plantaSeleccionada));
      return p ? p.nombre : 'Seleccione establecimiento';
    } else {
      // Usuario normal: mostrar solo su planta
      const p = plantas.find((pl) => String(pl.id_planta) === String(plantaDelUsuario));
      return p ? p.nombre : 'Cargando...';
    }
  };

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const años = Array.from({ length: 5 }, (_, i) =>
    new Date().getFullYear() - 2 + i
  );

  const diasOrdenados = Object.keys(dataByDay).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Resumen Mensual de Faenas y Decomisos
          </h1>
          <p className="text-gray-600">
            Informe consolidado de actividades por establecimiento
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Establecimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Establecimiento
              </label>
              {rol === 1 ? (
                <select
                  value={plantaSeleccionada}
                  onChange={(e) => setPlantaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todas</option>
                  {plantas.map((p) => (
                    <option key={p.id_planta} value={p.id_planta}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              ) : plantas.length > 0 ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium">
                  {getNombrePlanta()}
                </div>
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                  Cargando plantas...
                </div>
              )}
            </div>

            {/* Mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {meses.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                value={año}
                onChange={(e) => setAño(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {años.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Refrescar */}
            <div className="flex items-end">
              <button
                onClick={loadData}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? 'Cargando...' : 'Refrescar'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabla de Resumen */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📋 Resumen Mensual
          </h2>

          {diasOrdenados.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay datos registrados para este período
            </p>
          ) : (
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left text-gray-700 font-semibold border-b">
                    Día
                  </th>
                  <th className="px-2 sm:px-4 py-2 text-center text-gray-700 font-semibold border-b">
                    Animales Afectados
                  </th>
                  {Array.from(enfermedades)
                    .sort()
                    .map((enf) => (
                      <th
                        key={enf}
                        className="px-2 sm:px-4 py-2 text-left text-gray-700 font-semibold border-b text-xs"
                      >
                        {enf}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {diasOrdenados.map((dia, idx) => {
                  const dayData = dataByDay[dia];
                  return (
                    <tr
                      key={dia}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      {/* Día */}
                      <td className="px-2 sm:px-4 py-3 border-b font-semibold text-gray-800">
                        {dia}
                      </td>

                      {/* Total de Animales Afectados */}
                      <td className="px-2 sm:px-4 py-3 border-b text-center text-gray-700">
                        {dayData.totalAnimales}
                      </td>

                      {/* Decomisos por Enfermedad */}
                      {Array.from(enfermedades)
                        .sort()
                        .map((enf) => (
                          <td
                            key={`${dia}-${enf}`}
                            className="px-2 sm:px-4 py-3 border-b text-gray-700 align-top"
                          >
                            {dayData.decomisos[enf] ? (
                              <div className="space-y-2">
                                {Object.entries(dayData.decomisos[enf]).map(
                                  ([tipoParte, partes]) => (
                                    <div key={tipoParte} className="bg-gray-50 p-2 rounded">
                                      <div className="font-semibold text-gray-800 text-xs mb-1">
                                        {tipoParte}
                                      </div>
                                      {Object.entries(partes).map(
                                        ([nombreParte, cantidad]) => (
                                          <div
                                            key={nombreParte}
                                            className="flex justify-between text-xs text-gray-700 ml-1"
                                          >
                                            <span>{nombreParte}:</span>
                                            <span className="font-semibold">
                                              {cantidad}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

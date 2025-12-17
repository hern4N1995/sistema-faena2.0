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
  const [animalesFaenados, setAnimalesFaenados] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [titularesPorCategoria, setTitularesPorCategoria] = useState({});

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
      // Cargar observaciones guardadas
      const obsGuardadas = localStorage.getItem(`informe-observaciones-${mes}-${año}-${plantaSeleccionada || 'todas'}`);
      if (obsGuardadas) {
        setObservaciones(obsGuardadas);
      } else {
        setObservaciones('');
      }
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
      // Obtener decomisos y faenas
      const decomisosRes = await api.get('/decomisos');
      const faenasRes = await api.get('/faena/faenas-realizadas');
      const detallesRes = await api.get('/faena/detalles-categorias');
      let decomisosData = decomisosRes.data || [];
      let faenasData = faenasRes.data?.faenas || faenasRes.data || [];
      let detallesFaenaData = detallesRes.data || [];

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
      console.log('[InformesPage] Faenas datos crudos:', faenasData);

      // Procesar faenas para obtener animales faenados por día
      const animalesPorDia = {};
      
      faenasData.forEach((f) => {
        try {
          const fecha = new Date(f.fecha_faena);
          if (isNaN(fecha.getTime())) {
            console.log('[InformesPage] Faena sin fecha válida:', f);
            return;
          }
          
          const esMesAño =
            fecha.getMonth() + 1 === parseInt(mes) &&
            fecha.getFullYear() === parseInt(año);
          
          if (!esMesAño) return;

          // Filtrar por planta según rol
          if (rol !== 1) {
            if (String(plantaDelUsuario) !== String(f.id_planta)) return;
          } else if (plantaSeleccionada && plantaSeleccionada !== '') {
            if (String(plantaSeleccionada) !== String(f.id_planta)) return;
          }

          const dia = String(fecha.getDate()).padStart(2, '0');
          const cantidad = parseInt(f.total_faenado) || 0;
          
          console.log(`[InformesPage] Faena día ${dia}: cantidad=${cantidad}, faena:`, f);
          
          if (!animalesPorDia[dia]) {
            animalesPorDia[dia] = 0;
          }
          
          if (cantidad > 0) {
            animalesPorDia[dia] += cantidad;
          }
        } catch (err) {
          console.error('[InformesPage] Error procesando faena:', err);
        }
      });
      
      console.log('[InformesPage] Animales por día:', animalesPorDia);
      setAnimalesFaenados(animalesPorDia);

      // Procesar faenas para obtener categorías por especie (dinámico)
      const categoriasAnimales = {};

      detallesFaenaData.forEach((detalle) => {
        try {
          const fecha = new Date(detalle.fecha_faena);
          if (isNaN(fecha.getTime())) return;
          
          const esMesAño =
            fecha.getMonth() + 1 === parseInt(mes) &&
            fecha.getFullYear() === parseInt(año);
          
          if (!esMesAño) return;

          // Filtrar por planta según rol
          if (rol !== 1) {
            if (String(plantaDelUsuario) !== String(detalle.id_planta)) return;
          } else if (plantaSeleccionada && plantaSeleccionada !== '') {
            if (String(plantaSeleccionada) !== String(detalle.id_planta)) return;
          }

          // Procesar categoría de animal
          const especie = detalle.especie || 'Bovinos';
          const categoria = detalle.categoria_especie || 'Sin categoría';
          const cantidad = parseInt(detalle.cantidad_faena) || 0;
          
          console.log(`[InformesPage] Detalle faena - Especie: ${especie}, Categoría: ${categoria}, Cantidad: ${cantidad}`);
          
          // Crear entrada de especie si no existe
          if (!categoriasAnimales[especie]) {
            categoriasAnimales[especie] = {};
          }
          
          // Crear entrada de categoría si no existe
          if (!categoriasAnimales[especie][categoria]) {
            categoriasAnimales[especie][categoria] = 0;
          }
          
          categoriasAnimales[especie][categoria] += cantidad;
        } catch (err) {
          console.error('[InformesPage] Error procesando categoría:', err);
        }
      });

      setTitularesPorCategoria(categoriasAnimales);

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
        <div className="mb-8 no-print">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Resumen Mensual de Faenas y Decomisos
          </h1>
          <p className="text-gray-600">
            Informe consolidado de actividades por establecimiento
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 no-print">
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 no-print">
            {error}
          </div>
        )}

        {/* Contenedor principal del reporte */}
        <div id="report-content" className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Botón de impresión */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-green-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">📋 Informe Mensual</h2>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base print:hidden whitespace-nowrap"
              title="Imprimir informe"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
          </div>

          {/* Contenido del reporte */}
          <div className="p-4 sm:p-8 overflow-x-auto">
            {diasOrdenados.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-xs sm:text-sm">
                No hay datos registrados para este período
              </p>
            ) : (
              <>
              {/* 1. ENCABEZADO DE METADATOS */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-300 print:break-after-avoid">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3">INFORME MENSUAL DE FAENAS Y DECOMISOS</h1>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-700">
                  <div><span className="font-semibold">Establecimiento:</span> <span className="text-gray-600">{getNombrePlanta()}</span></div>
                  <div><span className="font-semibold">Mes:</span> <span className="text-gray-600">{meses[parseInt(mes) - 1]} {año}</span></div>
                </div>
                <div className="mt-3 text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">Total Tasa por Servicio:</span> <span className="text-gray-500">[Valor a calcular]</span>
                </div>
              </div>

              {/* 2. TABLA DE FAENAS DIARIAS Y CAUSALES - LADO A LADO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* COLUMNA 1: FAENAS DIARIAS */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <h2 className="text-sm font-bold text-gray-800 mb-3 px-4 pt-4">FAENAS DIARIAS</h2>
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">Día</th>
                        <th className="px-3 sm:px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">Animales Faenados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(animalesFaenados).sort((a, b) => parseInt(a) - parseInt(b)).map((dia) => (
                        <tr key={dia} className="border-b hover:bg-gray-50">
                          <td className="px-3 sm:px-4 py-2 text-left text-gray-800 border border-gray-300">{dia}</td>
                          <td className="px-3 sm:px-4 py-2 text-center text-gray-800 font-medium border border-gray-300">{animalesFaenados[dia]}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-green-200 font-bold">
                        <td className="px-3 sm:px-4 py-2 text-left text-gray-800 border border-gray-300">TOTAL</td>
                        <td className="px-3 sm:px-4 py-2 text-center text-gray-800 border border-gray-300">
                          {Object.values(animalesFaenados).reduce((sum, cantidad) => sum + cantidad, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* COLUMNA 2: CAUSALES DE DECOMISOS */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <div className="bg-green-100 px-4 py-2">
                    <h2 className="text-sm font-bold text-gray-800">CAUSALES DE DECOMISOS</h2>
                  </div>
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">Causa</th>
                        <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">Detalle</th>
                        <th className="px-3 sm:px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(enfermedades).sort().map((enfermedad) => {
                        // Calcular total por enfermedad
                        let totalEnfermedad = 0;
                        const detalles = [];
                        
                        diasOrdenados.forEach((dia) => {
                          const dayData = dataByDay[dia];
                          if (dayData.decomisos[enfermedad]) {
                            const tiposParteDelEnf = Object.keys(dayData.decomisos[enfermedad]);
                            tiposParteDelEnf.forEach((tipoParte) => {
                              Object.entries(dayData.decomisos[enfermedad][tipoParte]).forEach(([nombreParte, cantidad]) => {
                                totalEnfermedad += cantidad;
                                detalles.push({
                                  tipo: tipoParte,
                                  parte: nombreParte,
                                  cantidad: cantidad
                                });
                              });
                            });
                          }
                        });

                        return (
                          <React.Fragment key={enfermedad}>
                            {detalles.map((detalle, idx) => (
                              <tr key={`${enfermedad}-${idx}`} className="border-b hover:bg-gray-50">
                                {idx === 0 && (
                                  <td 
                                    rowSpan={detalles.length + 1} 
                                    className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-800 bg-blue-50 border border-gray-300 align-top"
                                  >
                                    {enfermedad}
                                  </td>
                                )}
                                <td className="px-3 sm:px-4 py-2 text-left text-gray-700 border border-gray-300 text-xs sm:text-sm">
                                  {detalle.tipo} - {detalle.parte}
                                </td>
                                <td className="px-3 sm:px-4 py-2 text-center text-gray-800 border border-gray-300 font-medium">{detalle.cantidad}</td>
                              </tr>
                            ))}
                            {/* Fila de subtotal por causa */}
                            <tr className="bg-green-100 font-bold border-b">
                              <td className="px-3 sm:px-4 py-2 text-right text-green-800 border border-gray-300">Subtotal {enfermedad}:</td>
                              <td className="px-3 sm:px-4 py-2 text-center text-green-800 border border-gray-300">{totalEnfermedad}</td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-green-200 font-bold border-t-2">
                        <td colSpan="2" className="px-3 sm:px-4 py-2 text-right text-gray-800 border border-gray-300">TOTAL DECOMISOS</td>
                        <td className="px-3 sm:px-4 py-2 text-center text-gray-800 border border-gray-300">
                          {Array.from(enfermedades).sort().reduce((sum, enfermedad) => {
                            let totalEnfermedad = 0;
                            diasOrdenados.forEach((dia) => {
                              const dayData = dataByDay[dia];
                              if (dayData.decomisos[enfermedad]) {
                                const tiposParteDelEnf = Object.keys(dayData.decomisos[enfermedad]);
                                tiposParteDelEnf.forEach((tipoParte) => {
                                  Object.entries(dayData.decomisos[enfermedad][tipoParte]).forEach(([, cantidad]) => {
                                    totalEnfermedad += cantidad;
                                  });
                                });
                              }
                            });
                            return sum + totalEnfermedad;
                          }, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 4. OBSERVACIONES */}
              <div className="mb-8">
                <div className="border-t-2 border-gray-300 pt-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 print:text-lg">OBSERVACIONES</h3>
                  <div className="mb-2">
                    <textarea
                      value={observaciones}
                      onChange={(e) => {
                        const texto = e.target.value.substring(0, 500);
                        setObservaciones(texto);
                        localStorage.setItem(`informe-observaciones-${mes}-${año}-${plantaSeleccionada || 'todas'}`, texto);
                      }}
                      placeholder="Escriba observaciones adicionales (máximo 500 caracteres)..."
                      className="w-full p-3 sm:p-4 border-2 border-gray-300 bg-white text-gray-700 text-xs sm:text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:border-green-300 print:border-black"
                      rows="4"
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 print:hidden">
                    {observaciones.length} / 500 caracteres
                  </div>
                </div>
              </div>

              {/* 5. TABLA FINAL DE TITULARES - ANCHO COMPLETO */}
              <div className="mb-8">
                <div className="bg-green-100 px-3 sm:px-4 py-2 mb-3 rounded-t-lg">
                  <h2 className="text-xs sm:text-sm font-bold text-gray-800">TITULARES DE FAENA POR CATEGORÍA</h2>
                </div>
                {(() => {
                  // Obtener todas las especies y categorías únicas del objeto dinámico
                  const especies = Object.keys(titularesPorCategoria).sort();
                  const todasLasCategorias = new Set();
                  
                  especies.forEach(especie => {
                    Object.keys(titularesPorCategoria[especie] || {}).forEach(cat => {
                      todasLasCategorias.add(cat);
                    });
                  });
                  
                  const categoriasOrdenadas = Array.from(todasLasCategorias).sort();
                  
                  if (categoriasOrdenadas.length === 0) {
                    return <p className="text-gray-500 text-center py-4 text-xs sm:text-sm">No hay faenas registradas</p>;
                  }

                  return (
                    <div className="overflow-x-auto rounded-b-lg border border-t-0 border-gray-200">
                      <table className="w-full text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="bg-green-100">
                            <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">Titular de Faena</th>
                            {categoriasOrdenadas.map((cat) => (
                              <th key={cat} className="px-3 sm:px-4 py-2 text-center font-semibold text-gray-700 border border-gray-300 whitespace-nowrap">
                                {cat}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {especies.map((especie, idx) => {
                            const tieneItems = categoriasOrdenadas.some(cat => (titularesPorCategoria[especie]?.[cat] || 0) > 0);
                            return tieneItems ? (
                              <tr key={especie} className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                                <td className="px-3 sm:px-4 py-2 text-left text-gray-800 font-medium border border-gray-300">{especie}</td>
                                {categoriasOrdenadas.map((cat) => (
                                  <td key={`${especie}-${cat}`} className="px-3 sm:px-4 py-2 text-center text-gray-700 font-medium border border-gray-300">
                                    {titularesPorCategoria[especie]?.[cat] || 0}
                                  </td>
                                ))}
                              </tr>
                            ) : null;
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-green-200 font-bold">
                            <td className="px-3 sm:px-4 py-2 text-left text-gray-800 border border-gray-300">TOTALES</td>
                            {categoriasOrdenadas.map((cat) => (
                              <td key={`total-${cat}`} className="px-3 sm:px-4 py-2 text-center text-gray-800 border border-gray-300">
                                {especies.reduce((sum, esp) => sum + (titularesPorCategoria[esp]?.[cat] || 0), 0)}
                              </td>
                            ))}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          /* Ocultar elementos específicos que no queremos imprimir */
          .no-print {
            display: none !important;
          }
          
          /* Configuración general de página */
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          /* Contenedor del reporte */
          #report-content {
            width: 100%;
            box-shadow: none;
            border-radius: 0;
            page-break-inside: avoid;
            margin: 0;
            padding: 0;
          }
          
          /* Botón de impresión oculto */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Estilos para tablas de impresión */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            margin-bottom: 10px;
          }
          
          thead {
            page-break-inside: avoid;
            background-color: #dcfce7 !important;
            color: #1f2937;
          }
          
          thead th {
            border: 1px solid #000 !important;
            padding: 6pt;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
          }
          
          tbody tr {
            page-break-inside: avoid;
            border: 1px solid #000 !important;
          }
          
          tbody td {
            border: 1px solid #000 !important;
            padding: 4pt;
            font-size: 9pt;
          }
          
          tfoot {
            background-color: #bbf7d0 !important;
            font-weight: bold;
            page-break-inside: avoid;
          }
          
          tfoot td {
            border: 1px solid #000 !important;
            padding: 6pt;
            font-size: 10pt;
          }
          
          /* Estilos para encabezados */
          h1 {
            page-break-after: avoid;
            font-size: 16pt;
            margin-bottom: 10px;
          }
          
          h2, h3 {
            page-break-after: avoid;
            margin-top: 8px;
            margin-bottom: 6px;
          }
          
          h2 {
            font-size: 12pt;
          }
          
          h3 {
            font-size: 11pt;
          }
          
          /* Estilos para contenido */
          div {
            page-break-inside: avoid;
          }
          
          /* Bordes */
          .border-b, .border-t-2, .border {
            border-color: #000 !important;
          }
          
          /* Márgenes de impresión */
          @page {
            margin: 0.4in;
            size: A4 landscape;
          }
          
          /* Scroll */
          .overflow-x-auto {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}

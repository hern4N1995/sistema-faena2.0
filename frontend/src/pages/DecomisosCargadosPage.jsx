import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

const DecomisosCargadosPage = () => {
  const [decomisos, setDecomisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rol, setRol] = useState(null);
  const [plantaDelUsuario, setPlantaDelUsuario] = useState(null);
  const [expandedDecomiso, setExpandedDecomiso] = useState(null);
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDecomiso, setEditingDecomiso] = useState(null);
  const [editErrors, setEditErrors] = useState([]);
  const [editSaving, setEditSaving] = useState(false);

  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const rowsPerPage = isMobile ? 3 : 6;

  // Obtener rol y planta del usuario desde localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        const userRol = userData.rol || userData.id_rol;
        setRol(parseInt(userRol));
        
        // Usar id_planta del usuario (viene del backend)
        if (parseInt(userRol) !== 1) {
          setPlantaDelUsuario(userData.id_planta);
        }
      }
    } catch (err) {
      console.error('[DecomisosCargadosPage] Error al obtener usuario:', err);
      setRol(1); // Default a admin para mostrar datos
    }
  }, []);

  useEffect(() => {
    const fetchDecomisos = async () => {
      try {
        console.log('[DecomisosCargadosPage] Cargando decomisos');
        const res = await api.get('/decomisos');
        console.log('[DecomisosCargadosPage] Respuesta completa:', res.data);

        let arr = [];
        if (Array.isArray(res.data)) {
          arr = res.data;
        } else if (res.data && typeof res.data === 'object') {
          if (Array.isArray(res.data.decomisos)) {
            arr = res.data.decomisos;
          } else if (Array.isArray(res.data.data)) {
            arr = res.data.data;
          } else if (Array.isArray(res.data.rows)) {
            arr = res.data.rows;
          }
        }

        console.log('[DecomisosCargadosPage] Array final:', arr.length, 'decomisos');

        // Agrupar detalles por id_decomiso (un decomiso puede tener múltiples detalles)
        const detallesMap = new Map();
        arr.forEach((row) => {
          if (!detallesMap.has(row.id_decomiso)) {
            detallesMap.set(row.id_decomiso, {
              id_decomiso: row.id_decomiso,
              id_faena: row.id_faena,
              fecha_faena: row.fecha_faena || row.fecha,
              fecha_decomiso: row.fecha_decomiso,
              n_tropa: row.n_tropa,
              dte_dtu: row.dte_dtu,
              id_planta: row.id_planta,
              nombre_planta: row.nombre_planta,
              cantidad_tropa: row.cantidad_tropa,
              cantidad_faena: row.cantidad_faena,
              cantidad_decomisada: 0,
              detalles: [],
            });
          }
          
          const decomiso = detallesMap.get(row.id_decomiso);
          if (row.id_decomiso_detalle) {
            decomiso.detalles.push({
              id_decomiso_detalle: row.id_decomiso_detalle,
              id_parte_decomisada: row.id_parte_decomisada,
              id_afeccion: row.id_afeccion,
              cantidad: row.cantidad,
              peso_kg: row.peso_kg,
              animales_afectados: row.animales_afectados,
              destino_decomiso: row.destino_decomiso,
              observaciones: row.observaciones,
              nombre_tipo_parte: row.nombre_tipo_parte,
              nombre_parte: row.nombre_parte,
              afeccion: row.afeccion,
            });
            decomiso.cantidad_decomisada += row.cantidad ? Number(row.cantidad) : 0;
          }
        });

        // Convertir map a array
        const agrupados = Array.from(detallesMap.values());

        agrupados.sort((a, b) => {
          const fa = parseDateString(a.fecha_decomiso);
          const fb = parseDateString(b.fecha_decomiso);
          if (!fa && !fb) return 0;
          if (!fa) return 1;
          if (!fb) return -1;
          return fb - fa;
        });

        // Filtrar por planta del usuario (si no es admin)
        if (rol !== 1 && plantaDelUsuario) {
          console.log('[DecomisosCargadosPage] Filtrando por planta del usuario:', plantaDelUsuario);
          const filtrados = agrupados.filter(
            (d) =>
              String(d.id_planta) === String(plantaDelUsuario)
          );
          console.log('[DecomisosCargadosPage] Después de filtrar:', filtrados.length, 'decomisos');
          setDecomisos(filtrados);
        } else if (rol === 1) {
          console.log('[DecomisosCargadosPage] Admin - mostrando todos los decomisos');
          setDecomisos(agrupados);
        } else {
          setDecomisos(agrupados);
        }
        setLoading(false);
      } catch (err) {
        console.error(
          '[DecomisosCargadosPage] Error al cargar decomisos:',
          err?.response?.data || err.message
        );
        setError('No se pudo cargar la lista de decomisos');
        setLoading(false);
      }
    };

    // Solo cargar cuando tengamos rol definido
    if (rol !== null) {
      fetchDecomisos();
    }
  }, [rol, plantaDelUsuario]);

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      // Si viene como string "YYYY-MM-DD", parsearlo directamente
      if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
        const [year, month, day] = fecha.split('T')[0].split('-');
        const date = new Date(year, parseInt(month) - 1, day);
        return date.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
      const f = new Date(fecha);
      if (isNaN(f.getTime())) return '—';
      return f.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '—';
    }
  };

  const parseDateString = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isEditableDecomiso = (fecha) => {
    const date = parseDateString(fecha || '');
    if (!date) return false;
    const diffDays = (new Date() - date) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const handleOpenEdit = (d) => {
    const fechaValue = d.fecha_decomiso || d.fecha;
    if (!isEditableDecomiso(fechaValue)) return;
    const fechaInput = (() => {
      const parsed = parseDateString(fechaValue);
      return parsed ? parsed.toISOString().split('T')[0] : '';
    })();

    setEditingDecomiso({
      ...d,
      fecha_decomiso: fechaInput,
      detalles: (d.detalles || []).map((det) => ({
        ...det,
        cantidad: det.cantidad != null ? String(det.cantidad) : '',
        animales_afectados:
          det.animales_afectados != null ? String(det.animales_afectados) : '',
        peso_kg: det.peso_kg != null ? String(det.peso_kg) : '',
        destino_decomiso: det.destino_decomiso || '',
        observaciones: det.observaciones || '',
      })),
    });
    setEditErrors([]);
    setEditModalOpen(true);
  };

  const updateEditingDetalle = (index, field, value) => {
    setEditingDecomiso((prev) => {
      if (!prev) return prev;
      const detalles = [...(prev.detalles || [])];
      detalles[index] = { ...detalles[index], [field]: value };
      return { ...prev, detalles };
    });
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingDecomiso(null);
    setEditErrors([]);
    setEditSaving(false);
  };

  const handleVerResumen = (id) => {
    console.log('[DecomisosCargadosPage] Navigating to resumen con id:', id);
    navigate(`/decomisos/detalle/${id}`);
  };

  const visibleDecomisos = React.useMemo(() => {
    const desdeDate = parseDateString(filterDesde);
    const hastaDate = parseDateString(filterHasta);
    const maxHasta = hastaDate
      ? new Date(hastaDate.getFullYear(), hastaDate.getMonth(), hastaDate.getDate(), 23, 59, 59, 999)
      : null;

    return decomisos.filter((d) => {
      if (!desdeDate && !maxHasta) return true;
      const fecha = parseDateString(d.fecha_decomiso || '');
      if (!fecha) return false;
      if (desdeDate && fecha < desdeDate) return false;
      if (maxHasta && fecha > maxHasta) return false;
      return true;
    });
  }, [decomisos, filterDesde, filterHasta]);

  const destinoOptions = [
    { value: 'incineracion', label: 'Incineración' },
    { value: 'rendering', label: 'Rendering' },
    { value: 'entierro', label: 'Entierro' },
    { value: 'desnaturalizacion', label: 'Desnaturalización' },
    { value: 'otro', label: 'Otro' },
  ];

  const formatDetalleDestino = (destino) =>
    destino ? destino.replace('_', ' ') : '—';

  const handleSaveEdit = async () => {
    if (!editingDecomiso) return;
    const errors = [];

    if (!editingDecomiso.fecha_decomiso) {
      errors.push('La fecha del decomiso es obligatoria.');
    }

    const totalCantidadDecomiso = (editingDecomiso.detalles || []).reduce((sum, det) => {
      const cantidad = det.cantidad != null ? Number(String(det.cantidad).trim()) : 0;
      return sum + cantidad;
    }, 0);

    if (totalCantidadDecomiso > editingDecomiso.cantidad_faena) {
      errors.push(
        `La cantidad total de decomiso (${totalCantidadDecomiso}) no puede superar la cantidad faenada (${editingDecomiso.cantidad_faena}).`
      );
    }

    const detallesPayload = (editingDecomiso.detalles || []).map((det, idx) => {
      const row = idx + 1;
      const cantidad = det.cantidad != null ? String(det.cantidad).trim() : '';
      const destino = String(det.destino_decomiso || '').trim();
      const pesoStr = det.peso_kg != null ? String(det.peso_kg).trim() : '';
      const animales = det.animales_afectados != null ? String(det.animales_afectados).trim() : '';

      if (!cantidad || Number(cantidad) <= 0) {
        errors.push(`Detalle ${row}: Cantidad debe ser mayor que 0.`);
      }
      if (!destino) {
        errors.push(`Detalle ${row}: Debés seleccionar un destino.`);
      }
      if (pesoStr !== '' && Number.isNaN(Number(pesoStr.replace(',', '.')))) {
        errors.push(`Detalle ${row}: Peso inválido.`);
      }

      return {
        id_parte_decomisada: det.id_parte_decomisada,
        id_afeccion: det.id_afeccion,
        cantidad: Number(cantidad),
        animales_afectados: animales ? Number(animales) : 0,
        peso_kg: pesoStr ? Number(pesoStr.replace(',', '.')) : 0,
        destino_decomiso: destino,
        observaciones: det.observaciones || null,
        fecha_decomiso: editingDecomiso.fecha_decomiso,
      };
    });

    if (errors.length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditSaving(true);
    try {
      const res = await api.put(
        `/decomisos/${editingDecomiso.id_decomiso}`,
        detallesPayload,
      );
      console.log('[DecomisosCargadosPage] Decomiso editado:', res.data);
      setDecomisos((prev) => {
        const updated = prev.map((d) =>
          d.id_decomiso === editingDecomiso.id_decomiso
            ? {
                ...d,
                fecha_decomiso: editingDecomiso.fecha_decomiso,
                detalles: editingDecomiso.detalles.map((det) => ({
                  ...det,
                  cantidad: Number(det.cantidad),
                  animales_afectados: det.animales_afectados
                    ? Number(det.animales_afectados)
                    : 0,
                  peso_kg: det.peso_kg ? Number(det.peso_kg.replace(',', '.')) : 0,
                })),
                cantidad_decomisada: editingDecomiso.detalles.reduce(
                  (sum, det) => sum + (Number(det.cantidad) || 0),
                  0,
                ),
              }
            : d,
        );
        return [...updated].sort((a, b) => {
          const fa = parseDateString(a.fecha_decomiso);
          const fb = parseDateString(b.fecha_decomiso);
          if (!fa && !fb) return 0;
          if (!fa) return 1;
          if (!fb) return -1;
          return fb - fa;
        });
      });
      closeEditModal();
    } catch (err) {
      console.error('[DecomisosCargadosPage] Error editando decomiso:', err);
      const msg = err?.response?.data?.error || 'No se pudo guardar el decomiso.';
      setEditErrors([msg]);
    } finally {
      setEditSaving(false);
    }
  };

  /* ---------------------------------------------------------- */
  /*  Paginación                                                */
  /* ---------------------------------------------------------- */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterDesde, filterHasta]);

  const totalPages = Math.ceil(visibleDecomisos.length / rowsPerPage);
  const paginatedDecomisos = visibleDecomisos.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const renderPaginacion = () => {
    if (totalPages <= 1) return null;
    return (
      <>
        <div className="text-center text-xs text-slate-500 mb-2">
          Mostrando {paginatedDecomisos.length} de {visibleDecomisos.length} decomisos
        </div>
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
      </>
    );
  };

  /* ---------------------------------------------------------- */
  /*  Card móvil                                                */
  /* ---------------------------------------------------------- */
  const DecomisoCard = ({ d }) => (
    <div className="rounded-xl shadow-sm border p-4 mb-4 bg-white border-slate-200 transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">
          {formatFecha(d.fecha_decomiso)}
        </span>
        <span className="text-sm font-semibold text-green-800">
          Faena #{d.n_tropa}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <strong>DTE/DTU:</strong> {d.dte_dtu || '—'}
        </p>
        <p>
          <strong>Planta:</strong> {plantaLabel(d)}
        </p>
        <p>
          <strong>Cant. Tropa:</strong> {d.cantidad_tropa}
        </p>
        <p>
          <strong>Faenados:</strong> {d.cantidad_faena}
        </p>
        <p>
          <strong>Decomisados:</strong> {d.cantidad_decomisada}
        </p>
      </div>

      {/* Detalles del decomiso */}
      {d.detalles && d.detalles.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-600 mb-2">Detalles del decomiso:</p>
          <div className="space-y-2">
            {d.detalles.map((det, idx) => (
              <div key={idx} className="bg-slate-50 rounded p-2 text-xs">
                <p className="font-semibold text-slate-700">{det.nombre_parte || '—'}</p>
                <p className="text-slate-600">
                  {det.nombre_tipo_parte && <span>{det.nombre_tipo_parte} • </span>}
                  {det.afeccion && <span>{det.afeccion}</span>}
                </p>
                <p className="text-slate-600 mt-1">
                  Cantidad: <span className="font-semibold">{det.cantidad}</span>
                  {det.peso_kg && <span> • Peso: {det.peso_kg}kg</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-start gap-2">
        {isEditableDecomiso(d.fecha_decomiso || d.fecha) && (
          <button
            onClick={() => handleOpenEdit(d)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition shadow text-sm"
          >
            Editar
          </button>
        )}
        <button
          onClick={() => handleVerResumen(d.id_decomiso)}
          className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition shadow text-sm"
        >
          Ver resumen
        </button>
      </div>
    </div>
  );

  const plantaLabel = (d) => {
    if (!d) return '—';
    // Buscar en diferentes estructuras posibles
    if (d.nombre_planta) return d.nombre_planta;
    if (d.planta && typeof d.planta === 'object') {
      return d.planta.nombre ?? (d.planta.id ? `Planta #${d.planta.id}` : '—');
    }
    if (d.planta_nombre) return d.planta_nombre;
    if (d.planta) return d.planta;
    return '—';
  };

  /* ---------------------------------------------------------- */
  /*  Vista principal                                           */
  /* ---------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center drop-shadow mb-10">
          📦 Decomisos Cargados
        </h1>
      </header>

      <section className="mb-6 max-w-5xl mx-auto rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Filtro por fecha</h2>
            <p className="text-sm text-slate-500">
              Usa las fechas "Desde" y "Hasta" para acotar los decomisos mostrados.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-600">
              <span className="mb-1 font-semibold">Desde</span>
              <input
                type="date"
                value={filterDesde}
                onChange={(e) => setFilterDesde(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-600">
              <span className="mb-1 font-semibold">Hasta</span>
              <input
                type="date"
                value={filterHasta}
                onChange={(e) => setFilterHasta(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      {editModalOpen && editingDecomiso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl overflow-y-auto max-h-[90vh] rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Editar Decomiso</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Editá los datos del decomiso dentro de los 7 días de registro.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="rounded-full bg-slate-100 text-slate-700 px-3 py-2 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {editErrors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold mb-2">Corrige los siguientes errores:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {editErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Tropa</p>
                  <p className="text-sm text-slate-800 font-semibold">{editingDecomiso.n_tropa}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Planta</p>
                  <p className="text-sm text-slate-800">{plantaLabel(editingDecomiso)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Fecha Decomiso</label>
                  <input
                    type="date"
                    value={editingDecomiso.fecha_decomiso || ''}
                    onChange={(e) =>
                      setEditingDecomiso((prev) => ({
                        ...prev,
                        fecha_decomiso: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-3">Detalles del decomiso</p>
                <div className="space-y-4">
                  {editingDecomiso.detalles.map((det, detIdx) => (
                    <div key={detIdx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500 uppercase mb-1">Parte</p>
                          <p className="text-sm font-semibold text-slate-800">{det.nombre_parte || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase mb-1">Tipo</p>
                          <p className="text-sm text-slate-800">{det.nombre_tipo_parte || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase mb-1">Afección</p>
                          <p className="text-sm text-slate-800">{det.afeccion || '—'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Cantidad</label>
                          <input
                            type="number"
                            min="0"
                            value={det.cantidad ?? ''}
                            onChange={(e) => updateEditingDetalle(detIdx, 'cantidad', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Peso (kg)</label>
                          <input
                            type="text"
                            value={det.peso_kg ?? ''}
                            onChange={(e) => updateEditingDetalle(detIdx, 'peso_kg', e.target.value)}
                            placeholder="0,0"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Animales afectados</label>
                          <input
                            type="number"
                            min="0"
                            value={det.animales_afectados ?? ''}
                            onChange={(e) => updateEditingDetalle(detIdx, 'animales_afectados', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Destino</label>
                          <select
                            value={det.destino_decomiso || ''}
                            onChange={(e) => updateEditingDetalle(detIdx, 'destino_decomiso', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
                          >
                            <option value="">Seleccionar</option>
                            {destinoOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500">Observaciones</label>
                          <input
                            type="text"
                            value={det.observaciones || ''}
                            onChange={(e) => updateEditingDetalle(detIdx, 'observaciones', e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                    editSaving
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-green-700 hover:bg-green-800'
                  }`}
                >
                  {editSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mt-10">
          <p className="text-base">❌ {error}</p>
        </div>
      ) : paginatedDecomisos.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-base">⚠️ No hay decomisos cargados.</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {paginatedDecomisos.map((d) => (
                <DecomisoCard key={d.id_decomiso} d={d} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="overflow-x-auto rounded-xl shadow-xl ring-1 ring-slate-200">
                <table className="min-w-[900px] w-full text-sm text-center text-slate-700">
                  <thead className="bg-green-700 text-white uppercase tracking-wide text-xs">
                    <tr>
                      <th className="px-3 py-3">Fecha Decomiso</th>
                      <th className="px-3 py-3">N° Tropa</th>
                      <th className="px-3 py-3">Planta</th>
                      <th className="px-3 py-3">DTE / DTU</th>
                      <th className="px-3 py-3">Cant. Tropa</th>
                      <th className="px-3 py-3">Faenados</th>
                      <th className="px-3 py-3">Decomisados</th>
                      <th className="px-3 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDecomisos.map((d, idx) => {
                      console.log(`[DecomisosCargadosPage] Fila ${idx}:`, d);
                      const isExpanded = expandedDecomiso === d.id_decomiso;
                      return (
                        <React.Fragment key={d.id_decomiso}>
                          <tr
                            className="border-b bg-white hover:bg-green-50 transition cursor-pointer"
                            onClick={() => setExpandedDecomiso(isExpanded ? null : d.id_decomiso)}
                          >
                            <td className="px-3 py-3">
                              {formatFecha(d.fecha_decomiso)}
                            </td>
                            <td className="px-3 py-3 font-semibold text-green-800">
                              {d.n_tropa}
                            </td>
                            <td className="px-3 py-3">
                              {plantaLabel(d)}
                            </td>
                            <td className="px-3 py-3 truncate">
                              {d.dte_dtu || '—'}
                            </td>
                            <td className="px-3 py-3">{d.cantidad_tropa}</td>
                            <td className="px-3 py-3">{d.cantidad_faena}</td>
                            <td className="px-3 py-3 font-semibold">
                              {d.cantidad_decomisada}
                            </td>
                            <td className="px-3 py-3 space-x-2">
                              {isEditableDecomiso(d.fecha_decomiso || d.fecha) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(d);
                                  }}
                                  className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-xs font-semibold shadow"
                                >
                                  Editar
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerResumen(d.id_decomiso);
                                }}
                                className="px-3 py-1 bg-green-700 text-white rounded-lg hover:bg-green-800 transition text-xs font-semibold shadow"
                              >
                                Ver resumen
                              </button>
                            </td>
                          </tr>

                          {/* Fila expandida con detalles */}
                          {isExpanded && d.detalles && d.detalles.length > 0 && (
                            <tr className="bg-slate-50 border-b">
                              <td colSpan="7" className="px-6 py-4">
                                <div className="bg-white rounded-lg p-4 border border-slate-200">
                                  <p className="font-semibold text-slate-700 mb-3 text-sm">
                                    📋 Detalles del Decomiso ({d.detalles.length})
                                  </p>
                                  <div className="space-y-2">
                                    {d.detalles.map((det, detIdx) => (
                                      <div
                                        key={detIdx}
                                        className="bg-slate-100 rounded p-3 text-sm grid grid-cols-2 gap-3"
                                      >
                                        <div>
                                          <p className="font-semibold text-slate-800">
                                            {det.nombre_parte || '—'}
                                          </p>
                                          <p className="text-xs text-slate-600 mt-1">
                                            {det.nombre_tipo_parte && <span>{det.nombre_tipo_parte} • </span>}
                                            {det.afeccion && <span>{det.afeccion}</span>}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-slate-700">
                                            <span className="font-semibold">Cant: {det.cantidad}</span>
                                          </p>
                                          {det.peso_kg && (
                                            <p className="text-xs text-slate-600">
                                              Peso: {det.peso_kg}kg
                                            </p>
                                          )}
                                          {det.destino_decomiso && (
                                            <p className="text-xs text-slate-600">
                                              Destino: {det.destino_decomiso}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ✅ Paginación única (sin duplicados) */}
          {renderPaginacion()}
        </>
      )}
    </div>
  );
};

export default DecomisosCargadosPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, [query]);
  return matches;
};

const FaenaPage = () => {
  const [tropas, setTropas] = useState([]);
  const [totalFaenar, setTotalFaenar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redirigiendoId, setRedirigiendoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rol, setRol] = useState(null);
  const [plantaDelUsuario, setPlantaDelUsuario] = useState(null);
  const navigate = useNavigate();

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const rowsPerPage = isMobile ? 3 : isTablet ? 5 : 7;

  // Normaliza datos básicos de la tropa (lo mínimo)
  const normalizeBasic = (r) => {
    let planta = null;
    if (r.planta)
      planta =
        typeof r.planta === 'object' ? r.planta : { nombre: String(r.planta) };
    else if (r.planta_nombre) planta = { nombre: r.planta_nombre };
    else if (r.planta_id) planta = { id: r.planta_id, nombre: null };

    return {
      id_tropa: r.id_tropa ?? r.id ?? null,
      n_tropa: r.n_tropa || r.nTropa || r.nro_tropa || r.nro || '',
      fecha: r.fecha || r.fecha_ingreso || r.created_at || null,
      dte_dtu: r.dte_dtu || r.dte || r.dtu || null,
      guia_policial: r.guia_policial || r.guia || null,
      productor: r.productor || r.productor_nombre || r.razon_social || null,
      departamento: r.departamento || r.nombre_departamento || null,
      titular_faena: r.titular || r.titular_faena || null,
      especie: r.especie ?? null, // se intentará completar con detalle
      total_a_faenar:
        r.total_a_faenar != null ? Number(r.total_a_faenar) : null, // se completará con detalle si no viene
      id_faena: r.id_faena ?? r.idFaena ?? null,
      planta,
      __raw: r,
    };
  };

  // Pide lista de tropas filtrada por planta del usuario (ruta protegida)
  const fetchTropasPorPlanta = async () => {
    setLoading(true);
    try {
      // Si es admin, obtener todas las tropas; si no, filtradas por su planta
      const endpoint = rol === 1 ? '/tropas' : '/tropas/por-planta';
      console.log('[FaenaPage] Usando endpoint:', endpoint, 'Rol:', rol);
      
      const res = await api.get(endpoint); // usa instancia axios con credenciales
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      const basics = data.map(normalizeBasic);

      // Para asegurar especie y total: pedir detalle por tropa (si endpoint disponible)
      const detallePromises = basics.map((t) =>
        api
          .get(`/tropas/${t.id_tropa}/detalle`)
          .then((r) => ({ status: 'fulfilled', id: t.id_tropa, data: r.data }))
          .catch((err) => {
            // Si falla (ej. 404), intentar con detalle-agrupado como fallback
            console.warn(
              `[FaenaPage] getDetalle failed for tropa ${t.id_tropa}, trying detalle-agrupado`
            );
            return api
              .get(`/tropas/${t.id_tropa}/detalle-agrupado`)
              .then((r) => ({
                status: 'fulfilled',
                id: t.id_tropa,
                data: r.data,
              }))
              .catch((err2) => {
                console.warn(
                  `[FaenaPage] Both getDetalle and getDetalleAgrupado failed for tropa ${t.id_tropa}`,
                  err2?.message
                );
                return { status: 'rejected', id: t.id_tropa, error: err2 };
              });
          })
      );

      const detalles = await Promise.allSettled(detallePromises);

      // Map id -> detalleData (cuando disponible)
      const detalleMap = new Map();
      for (const p of detalles) {
        if (
          p.status === 'fulfilled' &&
          p.value &&
          p.value.status === 'fulfilled' &&
          p.value.data
        ) {
          detalleMap.set(p.value.id, p.value.data);
        } else if (
          p.status === 'fulfilled' &&
          p.value &&
          p.value.status === 'rejected'
        ) {
          // la promesa interna falló; ignoramos
        } else if (p.status === 'rejected') {
          // Promise.allSettled wrapper rejected (no debería pasar), ignoramos
        }
      }

      // Consolida datos: si detalle disponible, extrae especie y total (remanente o cantidad - faenados)
      const consolidated = basics.map((t) => {
        const det = detalleMap.get(t.id_tropa) ?? null;
        if (!det) return t;

        // det puede venir como objeto con categorias: [{ nombre_categoria, remanente, especie, ... }]
        // o como array de filas; manejamos variantes.
        let categorias = [];
        if (Array.isArray(det.categorias)) categorias = det.categorias;
        else if (Array.isArray(det)) categorias = det;
        else if (Array.isArray(det.data)) categorias = det.data;

        // Obtener especie: priorizar primera categoria.especie o categoria.especie
        let especie = t.especie;
        if (!especie && categorias.length > 0) {
          const first = categorias.find(
            (c) =>
              c.especie ||
              c.nombre_especie ||
              c.nombre_categoria ||
              c.especie_nombre
          );
          especie =
            first?.especie ??
            first?.nombre_especie ??
            first?.especie_nombre ??
            null;
        }

        // Calcular total_a_faenar:
        // - si categorias tienen remanente, sumarlo.
        // - si tienen cantidad y faenados/cantidad_faena, sumar (cantidad - faenados).
        let total = t.total_a_faenar;
        if ((total == null || total === 0) && categorias.length > 0) {
          // buscar remanente directo
          const sumRem = categorias.reduce((acc, c) => {
            const rem =
              c.remanente ?? c.remanente_total ?? c.remanente_categoria ?? null;
            if (rem != null && !Number.isNaN(Number(rem)))
              return acc + Number(rem);
            // si no viene remanente, intentar cantidad - faenados
            const cantidad = c.cantidad ?? c.cantidad_total ?? c.cant ?? null;
            const faenados =
              c.faenados ?? c.cantidad_faena ?? c.cantidad_faenada ?? 0;
            if (cantidad != null && !Number.isNaN(Number(cantidad))) {
              const remCalc = Number(cantidad) - Number(faenados || 0);
              return acc + (Number.isFinite(remCalc) ? remCalc : 0);
            }
            return acc;
          }, 0);
          total = sumRem;
        }

        return {
          ...t,
          especie: especie ?? t.especie ?? null,
          total_a_faenar: total != null ? Number(total) : t.total_a_faenar,
        };
      });

      // Filtrar según criterio: si total_a_faenar existe, mostrar >0; si es null mostramos igualmente (como antes)
      const disponibles = consolidated.filter(
        (t) =>
          t.id_tropa != null &&
          (t.total_a_faenar == null ? true : t.total_a_faenar > 0)
      );

      // ordenar por fecha desc, y si la fecha es igual, por id_tropa descendente (última creada primero)
      const ordenadas = disponibles.slice().sort((a, b) => {
        const da = a.fecha ? new Date(a.fecha) : new Date(0);
        const db = b.fecha ? new Date(b.fecha) : new Date(0);
        const dateCompare = db - da;
        if (dateCompare !== 0) return dateCompare;
        return (b.id_tropa || 0) - (a.id_tropa || 0);
      });

      const totalGeneral = ordenadas.reduce(
        (acc, t) =>
          acc +
          (Number.isFinite(Number(t.total_a_faenar))
            ? Number(t.total_a_faenar)
            : 0),
        0
      );

      setTropas(ordenadas);
      setTotalFaenar(totalGeneral);
    } catch (err) {
      console.error('Error al cargar tropas por planta:', err);
      setTropas([]);
      setTotalFaenar(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obtener rol y planta del usuario desde localStorage
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
      console.error('[FaenaPage] Error al obtener usuario:', err);
      setRol(1); // Default a admin para mostrar datos
    }
  }, []);

  useEffect(() => {
    if (rol !== null) {
      fetchTropasPorPlanta();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleFaenar = (t) => {
    setRedirigiendoId(t.id_tropa);
    const destino = t.id_faena
      ? `/faena/${t.id_faena}`
      : `/faena/nueva/${t.id_tropa}`;
    navigate(destino);
    setTimeout(() => {
      fetchTropasPorPlanta();
      setRedirigiendoId(null);
    }, 1000);
  };

  const esTropaVencida = (t) => {
    if (!t.fecha) return false;
    const fechaTropa = new Date(t.fecha);
    const hoy = new Date();
    const diferenciaDias = (hoy - fechaTropa) / (1000 * 60 * 60 * 24);
    return (
      diferenciaDias > 2 &&
      (t.total_a_faenar == null ? false : t.total_a_faenar > 0)
    );
  };

  const plantaLabel = (t) => {
    if (!t) return '—';
    if (t.planta && typeof t.planta === 'object') {
      return t.planta.nombre ?? (t.planta.id ? `Planta #${t.planta.id}` : '—');
    }
    return t.planta_nombre ?? t.planta ?? '—';
  };

  const TropaCard = ({ t }) => (
    <div
      className={`rounded-xl shadow border p-4 mb-4 ${
        esTropaVencida(t)
          ? 'bg-red-300 border-red-500'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">{formatDate(t.fecha)}</span>
        <span className="text-sm font-semibold text-green-800">
          Tropa #{t.n_tropa}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <strong>DTE/DTU:</strong> {t.dte_dtu || '—'}
        </p>
        <p>
          <strong>Planta:</strong> {plantaLabel(t)}
        </p>
        <p>
          <strong>Productor:</strong> {t.productor || '—'}
        </p>
        <p>
          <strong>Departamento:</strong> {t.departamento || '—'}
        </p>
        <p>
          <strong>Titular Faena:</strong> {t.titular_faena || '—'}
        </p>
        <p>
          <strong>Especie:</strong> {t.especie || '—'}
        </p>
        <p>
          <strong>Total a faenar:</strong> {t.total_a_faenar ?? '—'}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => handleFaenar(t)}
          disabled={redirigiendoId === t.id_tropa}
          className={`text-sm px-3 py-2 rounded font-semibold transition ${
            redirigiendoId === t.id_tropa
              ? 'bg-green-300 text-white cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {redirigiendoId === t.id_tropa ? 'Redirigiendo...' : 'Faenar'}
        </button>
      </div>
    </div>
  );

  const totalPages = Math.max(1, Math.ceil(tropas.length / rowsPerPage));
  const paginatedTropas = tropas.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-6">
      <header className="mb-0">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-slate-800 drop-shadow mb-3">
          📋 Tropas a Faenar
        </h1>
        <div className="mt-1 mr-10 flex justify-end">
          <p className="text-sm font-semibold text-green-700">
            Total general a faenar:{' '}
            <span className="text-green-900">{totalFaenar}</span>
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
        </div>
      ) : tropas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-lg">No hay tropas disponibles para faenar.</p>
        </div>
      ) : isMobile ? (
        <div className="max-w-2xl mx-auto">
          {paginatedTropas.map((t) => (
            <TropaCard
              key={t.id_tropa ?? `${t.n_tropa}-${Math.random()}`}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center px-4">
          <div className="w-full max-w-5xl overflow-x-auto overflow-y-auto max-h-[500px] rounded-xl shadow-xl ring-1 ring-slate-200">
            <table className="min-w-[1100px] w-full text-sm text-center text-slate-700">
              <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">DTE/DTU</th>
                  <th className="px-3 py-2">Planta</th>
                  <th className="px-3 py-2">Nº Tropa</th>
                  <th className="px-3 py-2">Productor</th>
                  <th className="px-3 py-2">Departamento</th>
                  <th className="px-3 py-2">Titular Faena</th>
                  <th className="px-3 py-2">Especie</th>
                  <th className="px-3 py-2">Total a faenar</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTropas.map((t) => (
                  <tr
                    key={t.id_tropa ?? `${t.n_tropa}-${Math.random()}`}
                    className={`border-b last:border-b-0 transition-colors ${
                      esTropaVencida(t)
                        ? 'bg-red-400 hover:bg-red-500'
                        : 'bg-white hover:bg-green-50'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {formatDate(t.fecha)}
                    </td>
                    <td className="px-3 py-2">{t.dte_dtu || '—'}</td>
                    <td className="px-3 py-2">{plantaLabel(t)}</td>
                    <td className="px-3 py-2 font-semibold text-green-800">
                      {t.n_tropa || '—'}
                    </td>
                    <td className="px-3 py-2">{t.productor || '—'}</td>
                    <td className="px-3 py-2">{t.departamento || '—'}</td>
                    <td className="px-3 py-2">{t.titular_faena || '—'}</td>
                    <td className="px-3 py-2">{t.especie || '—'}</td>
                    <td className="px-3 py-2 font-semibold">
                      {t.total_a_faenar ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleFaenar(t)}
                        disabled={redirigiendoId === t.id_tropa}
                        className={`text-xs px-1 py-0.5 rounded font-semibold transition ${
                          redirigiendoId === t.id_tropa
                            ? 'bg-green-300 text-white cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {redirigiendoId === t.id_tropa
                          ? 'Redir...'
                          : 'Faenar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tropas.length > rowsPerPage && (
        <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
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
                className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
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
              <span className="text-slate-500 text-xs">…</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
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
            className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
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
};

export default FaenaPage;

// DetalleTropa.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import api from '../services/api';

const INPUT_BASE_CLASS =
  'w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50';

function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = '— Seleccionar —',
  maxMenuHeight = 200,
  isDisabled = false,
  isClearable = false,
  selectKey = undefined,
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
      '&:hover': {
        borderColor: '#96f1b7',
      },
      '&:focus-within': {
        borderColor: '#22c55e',
      },
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
    indicatorsContainer: (base) => ({ ...base, height: '48px' }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      zIndex: 9999,
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
    <div className="flex flex-col">
      {label && (
        <label className="mb-2 font-semibold text-gray-700 text-sm">
          {label}
        </label>
      )}
      <Select
        key={selectKey}
        value={value ?? null}
        onChange={(sel) => onChange(sel ?? null)}
        options={options}
        placeholder={placeholder}
        maxMenuHeight={maxMenuHeight}
        isDisabled={isDisabled}
        isClearable={isClearable}
        styles={customStyles}
        noOptionsMessage={() => 'Sin opciones'}
        components={{ IndicatorSeparator: () => null }}
        onFocus={() => {
          setIsFocusing(true);
          setTimeout(() => setIsFocusing(false), 50);
        }}
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : undefined
        }
        menuPosition="fixed"
      />
    </div>
  );
}

export default function DetalleTropa() {
  const { tropaId } = useParams();

  // Normalizar el ID: si viene como string, convertir a número
  // tropaId debería ser un string como "137", lo pasamos al endpoint como está
  const id = tropaId ? String(tropaId).trim() : undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tropaInfo, setTropaInfo] = useState({
    numero_tropa: '',
    fecha: '',
    dte: '',
    titular: '',
    productor: '',
    planta: '',
  });

  const [detalle, setDetalle] = useState({ especie: '', categorias: [] });
  const [especies, setEspecies] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]); // canonical normalized
  const [especiesOptions, setEspeciesOptions] = useState([]);

  const [editCategoryOptions, setEditCategoryOptions] = useState([]); // per-edit catalog
  const [toast, setToast] = useState(null);

  const [editing, setEditing] = useState({
    id: null, // id_tropa_detalle as string
    id_cat_especie: '',
    remanente: '',
    id_especie: null,
    selectedCategory: null,
    selectKey: undefined,
  });

  const [confirmDelete, setConfirmDelete] = useState({ id: null, nombre: '' });

  const [bufferRows, setBufferRows] = useState([]);
  const [especieSeleccionada, setEspecieSeleccionada] = useState(null);
  const [catalogoCategorias, setCatalogoCategorias] = useState([]);
  const [nuevoDetalle, setNuevoDetalle] = useState({
    id_cat_especie: '',
    cantidad: '',
  });

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const showToast = (type, text, ms = 3000) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), ms);
  };

  const onlyDigits = (raw) =>
    raw == null ? '' : String(raw).replace(/\D/g, '');

  const normalizeOption = (o) => ({
    value: String(o.id_cat_especie ?? o.id ?? o.id_cat ?? o.value ?? ''),
    label: String(o.nombre ?? o.descripcion ?? o.label ?? o.descripcion ?? ''),
  });

  const fetchTropa = async () => {
    try {
      console.log('[DetalleTropa] Obteniendo tropa con ID:', id);
      const res = await api.get(`/tropas/${id}`, {
        headers: getTokenHeaders(),
      });
      console.log('[DetalleTropa] Respuesta de tropa:', res.data);

      const data = res.data || {};

      // Extraer datos con múltiples fallbacks
      const n_tropa = data.n_tropa ?? data.numero_tropa ?? data.numero ?? '';
      const dte_dtu = data.dte_dtu ?? data.dte ?? data.dtu ?? '';
      const fecha = data.fecha ?? '';
      const titular = data.titular ?? data.titular_nombre ?? '';
      const planta =
        data.planta ?? data.planta_nombre ?? data.nombre_planta ?? '';
      const productor =
        data.productor ?? data.productor_nombre ?? data.nombre_productor ?? '';

      setTropaInfo({
        numero_tropa: n_tropa || '',
        dte: dte_dtu || '',
        fecha: fecha || '',
        titular: titular || '',
        planta: planta || '',
        productor: productor || '',
      });

      console.log('[DetalleTropa] Tropa info seteada:', {
        numero_tropa: n_tropa || '',
        dte: dte_dtu || '',
        fecha: fecha || '',
        titular: titular || '',
        planta: planta || '',
        productor: productor || '',
      });
    } catch (err) {
      console.error('[DetalleTropa] Error al obtener tropa:', err);
      console.error('[DetalleTropa] URL intentada: /tropas/' + id);
      console.error('[DetalleTropa] Response status:', err.response?.status);
      console.error('[DetalleTropa] Response data:', err.response?.data);
      setError('No se pudo obtener la tropa');
    }
  };

  const fetchDetalleAgrupado = async () => {
    try {
      const res = await api.get(`/tropas/${id}/detalle-agrupado`, {
        headers: getTokenHeaders(),
      });
      const data = res.data || {};
      const categorias = Array.isArray(data.categorias) ? data.categorias : [];
      setDetalle({ especie: data.especie ?? '', categorias });

      // build canonical categoryOptions (value as string)
      const opts = categorias.map((c) => normalizeOption(c));
      const seen = new Set();
      const dedup = [];
      for (const o of opts) {
        if (!seen.has(o.value)) {
          seen.add(o.value);
          dedup.push(o);
        }
      }
      setCategoryOptions(dedup);
    } catch (err) {
      console.error('Error al obtener detalle agrupado:', err);
      setDetalle({ especie: '', categorias: [] });
      setCategoryOptions([]);
      setError((prev) => prev || 'No se pudo cargar el detalle de la tropa');
    }
  };

  const fetchEspecies = async () => {
    try {
      console.log('[DetalleTropa] Obteniendo especies...');

      // Intentar obtener de /especies primero
      try {
        const res = await api.get('/especies', { headers: getTokenHeaders() });
        console.log(
          '[DetalleTropa] Respuesta de especies (endpoint /especies):',
          res.data
        );

        const data = res.data;
        const activos = Array.isArray(data)
          ? data.filter((e) =>
              e.estado === undefined ? true : Boolean(e.estado)
            )
          : [];

        console.log('[DetalleTropa] Especies activas:', activos);

        const opts = activos.map((s) => ({
          value: s.id ?? s.id_especie ?? s.nombre,
          label: s.nombre ?? s.descripcion ?? String(s.id ?? ''),
        }));

        console.log('[DetalleTropa] Opciones de especies:', opts);

        setEspecies(activos);
        setEspeciesOptions(opts);
        return;
      } catch (err1) {
        console.warn(
          '[DetalleTropa] Error con /especies, intentando /categorias-especie:',
          err1.message
        );

        // Fallback: obtener especies desde categorías
        const resCat = await api.get('/categorias-especie', {
          headers: getTokenHeaders(),
        });
        console.log(
          '[DetalleTropa] Respuesta de categorias-especie:',
          resCat.data
        );

        const categorias = Array.isArray(resCat.data) ? resCat.data : [];
        const especiesSet = new Set();
        const especiesList = [];

        for (const cat of categorias) {
          const especieId = cat.id_especie;
          const especieNombre = cat.especie;

          if (especieId && !especiesSet.has(especieId)) {
            especiesSet.add(especieId);
            especiesList.push({
              id_especie: especieId,
              descripcion: especieNombre,
              id: especieId,
              nombre: especieNombre,
            });
          }
        }

        console.log(
          '[DetalleTropa] Especies extraídas de categorías:',
          especiesList
        );

        const opts = especiesList.map((s) => ({
          value: s.id_especie ?? s.id,
          label: s.descripcion ?? s.nombre,
        }));

        console.log(
          '[DetalleTropa] Opciones de especies (desde categorías):',
          opts
        );

        setEspecies(especiesList);
        setEspeciesOptions(opts);
      }
    } catch (err) {
      console.error('[DetalleTropa] Error al obtener especies:', err);
      console.error('[DetalleTropa] Error response:', err.response?.data);
      setEspecies([]);
      setEspeciesOptions([]);
      setError((prev) => prev || 'No se pudieron cargar las especies');
    }
  };
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      console.log('[DetalleTropa] Montando componente con ID:', id);
      setLoading(true);
      setError('');
      await Promise.all([
        fetchTropa(),
        fetchDetalleAgrupado(),
        fetchEspecies(),
      ]);
      if (mounted) {
        console.log('[DetalleTropa] Carga completada');
        setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const loadCategorias = async () => {
      if (!especieSeleccionada?.value) {
        console.log(
          '[DetalleTropa] Sin especie seleccionada, limpiando categorías'
        );
        setCatalogoCategorias([]);
        return;
      }

      console.log(
        '[DetalleTropa] Cargando categorías para especie:',
        especieSeleccionada.value
      );

      try {
        const r = await api.get(
          `/especies/${especieSeleccionada.value}/categorias`,
          { headers: getTokenHeaders() }
        );

        console.log('[DetalleTropa] Respuesta de categorías:', r.data);

        const list = Array.isArray(r.data) ? r.data : r.data?.categorias ?? [];

        console.log('[DetalleTropa] Categorías crudas:', list);

        const opts = list.map((c) => normalizeOption(c));

        console.log('[DetalleTropa] Categorías normalizadas:', opts);

        const seen = new Set();
        const dedup = [];
        for (const o of opts) {
          if (!seen.has(o.value)) {
            seen.add(o.value);
            dedup.push(o);
          }
        }

        console.log('[DetalleTropa] Categorías sin duplicar:', dedup);

        setCatalogoCategorias(dedup);
      } catch (err) {
        console.warn(
          '[DetalleTropa] No se pudieron cargar categorias para especie',
          especieSeleccionada?.value,
          err
        );
        console.warn('[DetalleTropa] Error response:', err.response?.data);

        // Fallback: obtener de categorias-especie y filtrar
        try {
          console.log(
            '[DetalleTropa] Intentando fallback con /categorias-especie'
          );
          const resCat = await api.get(`/categorias-especie`, {
            headers: getTokenHeaders(),
          });

          console.log(
            '[DetalleTropa] Respuesta de categorias-especie:',
            resCat.data
          );

          const allCats = Array.isArray(resCat.data) ? resCat.data : [];
          const filtradas = allCats.filter(
            (c) =>
              String(c.id_especie ?? c.especie_id ?? '') ===
              String(especieSeleccionada.value)
          );

          console.log(
            '[DetalleTropa] Categorías filtradas para especie:',
            filtradas
          );

          const opts = filtradas.map((c) => normalizeOption(c));

          const seen = new Set();
          const dedup = [];
          for (const o of opts) {
            if (!seen.has(o.value)) {
              seen.add(o.value);
              dedup.push(o);
            }
          }

          console.log(
            '[DetalleTropa] Categorías sin duplicar (fallback):',
            dedup
          );

          setCatalogoCategorias(dedup);
        } catch (err2) {
          console.warn('[DetalleTropa] Fallback también falló:', err2);
          setCatalogoCategorias([]);
        }
      }
    };
    loadCategorias();
  }, [especieSeleccionada]);

  const resolveIdFromItem = (item) => {
    if (!item) return null;
    const direct = item.id_tropa_detalle ?? item.id ?? item.id_detalle ?? null;
    if (direct != null) return direct;
    if (Array.isArray(item.rawRows) && item.rawRows.length > 0) {
      const r0 = item.rawRows[0];
      return r0?.id_tropa_detalle ?? r0?.id ?? r0?.id_detalle ?? null;
    }
    return null;
  };

  const fetchCategoriasByEspecie = async (especieId) => {
    if (!especieId) return [];
    // Primero intentar endpoint específico: /especies/:id/categorias
    try {
      const res = await api.get(`/especies/${especieId}/categorias`, {
        headers: getTokenHeaders(),
      });
      const rows = Array.isArray(res.data)
        ? res.data
        : res.data?.categorias ?? [];
      return rows.map((c) => ({
        value: String(c.id_cat_especie ?? c.id),
        label: String(
          c.descripcion ?? c.nombre ?? String(c.id_cat_especie ?? c.id)
        ),
        raw: c,
      }));
    } catch (e) {
      // Si falla (por ejemplo 404 en deploy), hacer fallback a /categorias-especie y filtrar
      console.warn(
        '[DetalleTropa] fetchCategoriasByEspecie failed, intentando fallback',
        especieId,
        e?.message
      );
      try {
        const r = await api.get('/categorias-especie', {
          headers: getTokenHeaders(),
        });
        const all = Array.isArray(r.data) ? r.data : r.data?.categorias ?? [];
        const filtered = all.filter(
          (c) =>
            String(c.id_especie ?? c.especie_id ?? '') === String(especieId)
        );
        return filtered.map((c) => ({
          value: String(c.id_cat_especie ?? c.id),
          label: String(
            c.descripcion ?? c.nombre ?? String(c.id_cat_especie ?? c.id)
          ),
          raw: c,
        }));
      } catch (e2) {
        console.warn(
          '[DetalleTropa] fetchCategoriasByEspecie fallback también falló',
          e2?.message
        );
        return [];
      }
    }
  };

  // openEdit: build editCategoryOptions and selectedCategory object
  const openEdit = async (item) => {
    const resolvedId = resolveIdFromItem(item);

    let especieId = item.id_especie ?? item.especie_id ?? null;
    if (
      !especieId &&
      item.especie &&
      Array.isArray(especies) &&
      especies.length > 0
    ) {
      const found = especies.find(
        (e) =>
          String(e.nombre ?? e.descripcion ?? '')
            .toLowerCase()
            .trim() ===
          String(item.especie ?? '')
            .toLowerCase()
            .trim()
      );
      if (found) especieId = found.id ?? found.id_especie ?? null;
    }

    let fetchedOptions = [];
    if (especieId) {
      try {
        fetchedOptions = await fetchCategoriasByEspecie(especieId);
      } catch {
        fetchedOptions = [];
      }
    }

    const sourceOptions =
      Array.isArray(fetchedOptions) && fetchedOptions.length > 0
        ? fetchedOptions
        : categoryOptions;

    // normalize and dedupe
    const seen = new Set();
    const dedup = [];
    for (const o of sourceOptions) {
      const vv = String(o.value ?? '');
      const label = String(o.label ?? vv);
      if (!seen.has(vv)) {
        seen.add(vv);
        dedup.push({ value: vv, label });
      } else {
        if (label && label !== '') {
          const idx = dedup.findIndex((x) => x.value === vv);
          if (idx >= 0 && (!dedup[idx].label || dedup[idx].label === ''))
            dedup[idx].label = label;
        }
      }
    }

    // current category id from various possible properties in payload
    const currentCategoryValue =
      item.id_cat_especie ??
      (item.rawRows && item.rawRows[0] && item.rawRows[0].id_cat_especie) ??
      item.categoria?.id_cat_especie ??
      item.categoria?.id ??
      item.id_cat ??
      '';
    const currentCategoryStr =
      currentCategoryValue === null || currentCategoryValue === undefined
        ? ''
        : String(currentCategoryValue);

    if (currentCategoryStr !== '') {
      const exists = dedup.some((x) => String(x.value) === currentCategoryStr);
      if (!exists) {
        const labelFromItem = String(
          item.nombre ??
            item.descripcion ??
            item.label ??
            (Array.isArray(item.rawRows) && item.rawRows[0]
              ? item.rawRows[0].nombre ?? item.rawRows[0].descripcion
              : '') ??
            currentCategoryStr
        );
        dedup.unshift({ value: currentCategoryStr, label: labelFromItem });
      }
    }

    // Defensive: do not remove options that look like the detail id; keep dedup as-is
    setEditCategoryOptions(dedup);

    const selectedObj =
      dedup.find((o) => String(o.value) === String(currentCategoryStr)) || null;
    const selectKeyForThisEdit = `cat-${
      resolvedId ?? 'noid'
    }-${currentCategoryStr}`;

    setEditing({
      id: resolvedId != null ? String(resolvedId) : null,
      id_cat_especie: currentCategoryStr,
      remanente: String(item.cantidad ?? item.remanente ?? 0),
      id_especie: especieId ?? null,
      selectedCategory: selectedObj,
      selectKey: selectKeyForThisEdit,
    });
  };

  const cancelEdit = () =>
    setEditing({
      id: null,
      id_cat_especie: '',
      remanente: '',
      id_especie: null,
      selectedCategory: null,
      selectKey: undefined,
    });

  const saveEdit = async () => {
    if (!editing.id)
      return showToast('error', 'Elemento sin id, no se puede editar.');

    const selectedOpt =
      editing.selectedCategory && editing.selectedCategory.value
        ? editing.selectedCategory
        : editCategoryOptions.find(
            (o) => String(o.value) === String(editing.id_cat_especie)
          ) ||
          categoryOptions.find(
            (o) => String(o.value) === String(editing.id_cat_especie)
          );

    const newCat = selectedOpt ? selectedOpt.value : undefined;
    const newCantidad = Number(editing.remanente || 0);

    try {
      const original =
        detalle.categorias.find((c) => {
          const ids = [c.id_tropa_detalle, c.id, c.id_detalle].map((v) =>
            v == null ? null : String(v)
          );
          return ids.includes(String(editing.id));
        }) || null;

      if (!original)
        return showToast(
          'error',
          'No se encontró el registro original para editar.'
        );

      const originalEspecieId =
        original?.id_especie ?? original?.especie_id ?? null;
      const newEspecieId = editing.id_especie ?? originalEspecieId ?? null;

      const especieChanged =
        newEspecieId != null &&
        originalEspecieId != null &&
        String(newEspecieId) !== String(originalEspecieId);
      const categoriaChanged =
        newCat !== undefined &&
        String(newCat) !==
          String(original.id_cat_especie ?? original.id_cat ?? '');

      if (especieChanged) {
        try {
          await api.delete(`/tropa-detalle/${editing.id}`, {
            headers: getTokenHeaders(),
          });
        } catch (eDel) {
          console.error(
            'No se pudo eliminar detalle para cambio de especie',
            eDel
          );
          return showToast(
            'error',
            'No se pudo cambiar la especie (error al eliminar registro antiguo).'
          );
        }

        const createPayload = [
          {
            id_especie: Number(newEspecieId),
            id_cat_especie: Number(newCat),
            cantidad: Number(newCantidad),
          },
        ];
        try {
          await api.post(`/tropas/${id}/detalle`, createPayload, {
            headers: getTokenHeaders(),
          });
          showToast('success', 'Especie y cantidad actualizadas.');
          cancelEdit();
          await fetchDetalleAgrupado();
          return;
        } catch (eCreate) {
          console.error(
            'Error creando nuevo detalle tras cambio de especie',
            eCreate
          );
          return showToast(
            'error',
            'No se pudo crear el nuevo detalle con la especie seleccionada.'
          );
        }
      }

      if (categoriaChanged) {
        const destino =
          detalle.categorias.find((c) => {
            const sameCat =
              String(c.id_cat_especie ?? c.id_cat ?? c.id) === String(newCat);
            const sameEspecie =
              (c.id_especie ?? c.especie_id ?? newEspecieId) != null
                ? String(c.id_especie ?? c.especie_id ?? '') ===
                  String(newEspecieId)
                : true;
            const isSameRow = [c.id_tropa_detalle, c.id, c.id_detalle]
              .map((v) => (v == null ? null : String(v)))
              .includes(String(editing.id));
            return sameCat && sameEspecie && !isSameRow;
          }) || null;

        if (destino) {
          try {
            await api.patch(
              `/tropa-detalle/${
                destino.id_tropa_detalle ?? destino.id ?? destino.id_detalle
              }`,
              { cantidad: Number(newCantidad) },
              { headers: getTokenHeaders() }
            );
          } catch (eUpd) {
            try {
              await api.put(
                `/tropa-detalle/${
                  destino.id_tropa_detalle ?? destino.id ?? destino.id_detalle
                }`,
                { cantidad: Number(newCantidad) },
                { headers: getTokenHeaders() }
              );
            } catch (ePut) {
              console.error('No se pudo actualizar fila destino', eUpd, ePut);
              return showToast(
                'error',
                'No se pudo actualizar la categoría destino.'
              );
            }
          }

          try {
            await api.delete(`/tropa-detalle/${editing.id}`, {
              headers: getTokenHeaders(),
            });
          } catch (eDel) {
            console.error(
              'No se pudo eliminar fila original tras mover cantidad',
              eDel
            );
          }

          showToast(
            'success',
            'Categoría reemplazada (se reemplazó cantidad en la categoría destino).'
          );
          cancelEdit();
          await fetchDetalleAgrupado();
          return;
        } else {
          const payload = {
            id_cat_especie: newCat,
            cantidad: Number(newCantidad),
          };
          try {
            await api.patch(`/tropa-detalle/${editing.id}`, payload, {
              headers: getTokenHeaders(),
            });
            showToast('success', 'Detalle actualizado.');
            cancelEdit();
            await fetchDetalleAgrupado();
            return;
          } catch (ePatch) {
            try {
              await api.put(`/tropa-detalle/${editing.id}`, payload, {
                headers: getTokenHeaders(),
              });
              showToast('success', 'Detalle actualizado.');
              cancelEdit();
              await fetchDetalleAgrupado();
              return;
            } catch (ePut) {
              console.error('PUT también falló', ePut);
              showToast('error', 'No se pudo actualizar el detalle.');
              return;
            }
          }
        }
      }

      // only cantidad changed
      {
        const payload = { cantidad: Number(newCantidad) };
        try {
          await api.patch(`/tropa-detalle/${editing.id}`, payload, {
            headers: getTokenHeaders(),
          });
          showToast('success', 'Cantidad reemplazada.');
          cancelEdit();
          await fetchDetalleAgrupado();
          return;
        } catch (ePatch) {
          try {
            await api.put(`/tropa-detalle/${editing.id}`, payload, {
              headers: getTokenHeaders(),
            });
            showToast('success', 'Cantidad reemplazada.');
            cancelEdit();
            await fetchDetalleAgrupado();
            return;
          } catch (ePut) {
            console.error('PUT también falló', ePut);
            showToast('error', 'No se pudo actualizar la cantidad.');
            return;
          }
        }
      }
    } catch (e) {
      console.error('saveEdit error', e);
      showToast('error', 'Error procesando la edición.');
    }
  };

  const openConfirmDelete = (item) => {
    const resolvedId = resolveIdFromItem(item);
    setConfirmDelete({
      id: resolvedId,
      nombre: item.nombre ?? item.descripcion ?? '',
    });
  };
  const cancelDelete = () => setConfirmDelete({ id: null, nombre: '' });
  const confirmDeleteNow = async () => {
    const did = confirmDelete.id;
    if (!did) return cancelDelete();
    try {
      await api.delete(`/tropa-detalle/${did}`, { headers: getTokenHeaders() });
      showToast('success', 'Detalle eliminado.');
      cancelDelete();
      await fetchDetalleAgrupado();
    } catch {
      showToast('error', 'No se pudo eliminar el detalle.');
    }
  };

  function addBufferRow() {
    if (!nuevoDetalle.id_cat_especie)
      return showToast('error', 'Seleccioná categoría.');
    const cantidadNum = Number(nuevoDetalle.cantidad || 0);
    if (Number.isNaN(cantidadNum) || cantidadNum <= 0)
      return showToast('error', 'Cantidad inválida.');

    const catalogoSnapshot =
      catalogoCategorias && catalogoCategorias.length > 0
        ? catalogoCategorias.slice()
        : null;
    const especieSnapshot = especieSeleccionada
      ? { value: especieSeleccionada.value, label: especieSeleccionada.label }
      : null;

    setBufferRows((s) => [
      ...s,
      {
        uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        id_cat_especie: Number.isFinite(Number(nuevoDetalle.id_cat_especie))
          ? Number(nuevoDetalle.id_cat_especie)
          : nuevoDetalle.id_cat_especie,
        cantidad: cantidadNum,
        especie: especieSnapshot,
        catalogo: catalogoSnapshot,
      },
    ]);

    setEspecieSeleccionada(null);
    setNuevoDetalle({ id_cat_especie: '', cantidad: '' });
  }

  const updateBufferRow = (uid, patch) =>
    setBufferRows((s) =>
      s.map((r) => (r.uid === uid ? { ...r, ...patch } : r))
    );
  const removeBufferRow = (uid) =>
    setBufferRows((s) => s.filter((r) => r.uid !== uid));

  const normalizeRow = (r) => {
    const idCatRaw = r.id_cat_especie ?? '';
    const idCatNum = idCatRaw === '' ? null : Number(idCatRaw);
    const cantidadRaw = r.cantidad;
    const cantidadNum =
      cantidadRaw === '' || cantidadRaw == null
        ? null
        : Number(String(cantidadRaw).replace(/\D/g, ''));
    return {
      id_cat_especie: Number.isFinite(idCatNum) ? idCatNum : null,
      cantidad: Number.isFinite(cantidadNum) ? cantidadNum : null,
    };
  };

  const saveBufferAll = async () => {
    if (!Array.isArray(bufferRows) || bufferRows.length === 0)
      return showToast('error', 'No hay detalle agregado para guardar.');

    const invalid = bufferRows.find(
      (r) =>
        r.id_cat_especie === '' ||
        r.id_cat_especie == null ||
        r.cantidad === '' ||
        r.cantidad == null ||
        Number.isNaN(Number(r.cantidad)) ||
        Number(r.cantidad) <= 0
    );
    if (invalid)
      return showToast(
        'error',
        'Completá categoría y cantidad válida en todas las filas.'
      );

    const detallesToSend = bufferRows
      .map((r) => {
        const id_cat_especie = Number.isFinite(Number(r.id_cat_especie))
          ? Number(r.id_cat_especie)
          : r.id_cat_especie;
        const cantidad = Number(r.cantidad);

        const resolvedEspecieId =
          r.especie && r.especie.value !== undefined
            ? Number.isFinite(Number(r.especie.value))
              ? Number(r.especie.value)
              : r.especie.value
            : especieSeleccionada
            ? Number.isFinite(Number(especieSeleccionada.value))
              ? Number(especieSeleccionada.value)
              : especieSeleccionada.value
            : null;

        return {
          id_especie:
            resolvedEspecieId != null ? Number(resolvedEspecieId) : null,
          id_cat_especie,
          cantidad,
        };
      })
      .filter(
        (d) =>
          d.id_especie != null &&
          d.id_cat_especie != null &&
          Number.isFinite(d.cantidad) &&
          d.cantidad > 0
      );

    if (detallesToSend.length === 0)
      return showToast('error', 'No hay detalles válidos para enviar.');

    try {
      try {
        console.log(
          '[DetalleTropa] Enviando array detalles:',
          JSON.stringify(detallesToSend)
        );
      } catch {
        console.log(
          '[DetalleTropa] Enviando array detalles (raw):',
          detallesToSend
        );
      }

      const headers = {
        'Content-Type': 'application/json',
        ...getTokenHeaders(),
      };
      const res = await api.post(`/tropas/${id}/detalle`, detallesToSend, {
        headers,
      });

      if (res && res.data && (res.data.error || res.data.mensaje)) {
        const msg =
          res.data.error || res.data.mensaje || JSON.stringify(res.data);
        showToast('error', `Error servidor: ${msg}`);
        return;
      }

      showToast('success', 'Detalle agregado.');
      setBufferRows([]);
      await fetchDetalleAgrupado();

      setTimeout(() => {
        try {
          const target = document.getElementById('animales-cargados');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.animate(
              [
                { boxShadow: '0 0 0 0 rgba(34,197,94,0.0)' },
                { boxShadow: '0 0 0 6px rgba(34,197,94,0.18)' },
                { boxShadow: '0 0 0 0 rgba(34,197,94,0.0)' },
              ],
              { duration: 900 }
            );
          }
        } catch (e) {
          console.warn('No se pudo desplazar a animales cargados', e);
        }
      }, 120);
    } catch (err) {
      console.error('[DetalleTropa] error guardar buffer', err);
      let serverMsg = 'No se pudo guardar el detalle agregado.';
      if (err?.response?.data) {
        const body = err.response.data;
        if (typeof body === 'string') serverMsg = body;
        else if (body.error) serverMsg = body.error;
        else if (body.mensaje) serverMsg = body.mensaje;
        else serverMsg = JSON.stringify(body);
      } else if (err?.message) serverMsg = err.message;
      showToast('error', serverMsg);
    }
  };

  // Build grouped view by especie -> categorias (keeps rawRows)
  const speciesGroups = useMemo(() => {
    const rows = Array.isArray(detalle.categorias) ? detalle.categorias : [];
    const speciesMap = new Map();

    for (const r of rows) {
      const especieName =
        r.especie ?? r.nombre_especie ?? String(r.id_especie ?? 'Sin especie');
      const speciesKey = String(especieName || 'Sin especie');

      if (!speciesMap.has(speciesKey)) speciesMap.set(speciesKey, new Map());

      const catKey = String(
        r.id_cat_especie ??
          r.nombre ??
          r.descripcion ??
          r.id ??
          r.id_tropa_detalle ??
          ''
      );
      const catMap = speciesMap.get(speciesKey);

      const idTropaDetalle = r.id_tropa_detalle ?? r.id ?? r.id_detalle ?? null;
      const cantidad = Number(r.cantidad ?? r.remanente ?? 0);
      const nombre = r.nombre ?? r.descripcion ?? r.label ?? '';

      if (!catMap.has(catKey)) {
        catMap.set(catKey, {
          key: catKey,
          id_cat_especie: r.id_cat_especie ?? null,
          nombre,
          cantidad,
          especie: especieName,
          id_tropa_detalle: idTropaDetalle,
          rawRows: [r],
        });
      } else {
        const cur = catMap.get(catKey);
        cur.cantidad += cantidad;
        cur.rawRows.push(r);
        if (!cur.id_tropa_detalle && idTropaDetalle)
          cur.id_tropa_detalle = idTropaDetalle;
      }
    }

    const result = [];
    for (const [especie, catMap] of speciesMap.entries())
      result.push({ especie, categorias: Array.from(catMap.values()) });
    return result;
  }, [detalle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Cargando detalle de tropa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Detalle de Tropa
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Planta
            </label>
            <input
              type="text"
              value={
                typeof tropaInfo.planta === 'object'
                  ? tropaInfo.planta?.nombre || ''
                  : tropaInfo.planta || ''
              }
              disabled
              className={INPUT_BASE_CLASS}
            />
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Productor
            </label>
            <input
              type="text"
              value={tropaInfo.productor || ''}
              disabled
              className={INPUT_BASE_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Nº Tropa', value: tropaInfo.numero_tropa },
            { label: 'Fecha', value: tropaInfo.fecha?.split('T')[0] || '' },
            { label: 'DTE/DTU', value: tropaInfo.dte },
            { label: 'Titular', value: tropaInfo.titular },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={value || ''}
                disabled
                className={INPUT_BASE_CLASS}
              />
            </div>
          ))}
        </div>

        <div
          id="animales-cargados"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Animales cargados
          </h2>

          {!speciesGroups || speciesGroups.length === 0 ? (
            <p className="text-gray-500 text-center">
              No se han registrado animales en esta tropa.
            </p>
          ) : (
            <>
              {speciesGroups.map((species) => {
                const totalForSpecies = species.categorias.reduce(
                  (acc, i) => acc + (Number(i.cantidad) || 0),
                  0
                );
                return (
                  <div key={species.especie} className="mb-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-3">
                      {species.especie}
                    </h3>

                    <div className="sm:hidden space-y-4">
                      {species.categorias.map((item) => {
                        const itemId = resolveIdFromItem(item) ?? item.key;
                        const isEditing =
                          editing.id && String(editing.id) === String(itemId);
                        return (
                          <div
                            key={item.key}
                            className="space-y-2 bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-base font-semibold text-gray-700">
                                  {item.nombre || item.key}
                                </h4>
                                <div className="text-xs text-gray-500">
                                  Cant: {item.cantidad}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit({
                                      ...item,
                                      id_tropa_detalle: item.id_tropa_detalle,
                                      rawRows: item.rawRows,
                                    })
                                  }
                                  className="px-3 py-1 bg-yellow-500 text-white rounded text-xs font-medium hover:bg-yellow-600"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openConfirmDelete({
                                      ...item,
                                      id_tropa_detalle: item.id_tropa_detalle,
                                      rawRows: item.rawRows,
                                    })
                                  }
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>

                            {isEditing && (
                              <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                                <SelectField
                                  label="Especie (editar)"
                                  value={
                                    especiesOptions.find(
                                      (o) =>
                                        String(o.value) ===
                                        String(editing.id_especie)
                                    ) || null
                                  }
                                  onChange={(opt) =>
                                    setEditing((s) => ({
                                      ...s,
                                      id_especie: opt?.value ?? null,
                                    }))
                                  }
                                  options={especiesOptions}
                                  placeholder="— Seleccionar especie —"
                                  isClearable={false}
                                />
                                <SelectField
                                  label="Categoría"
                                  selectKey={editing.selectKey}
                                  value={
                                    editing.selectedCategory
                                      ? editing.selectedCategory
                                      : (editCategoryOptions &&
                                        editCategoryOptions.length > 0
                                          ? editCategoryOptions
                                          : categoryOptions
                                        ).find(
                                          (o) =>
                                            String(o.value) ===
                                            String(editing.id_cat_especie)
                                        ) || null
                                  }
                                  onChange={(opt) =>
                                    setEditing((s) => ({
                                      ...s,
                                      id_cat_especie: opt?.value ?? '',
                                      selectedCategory: opt ?? null,
                                    }))
                                  }
                                  options={
                                    editCategoryOptions.length > 0
                                      ? editCategoryOptions
                                      : categoryOptions
                                  }
                                  placeholder="— Seleccionar categoría —"
                                />
                                <input
                                  className={`${INPUT_BASE_CLASS} text-gray-800`}
                                  value={editing.remanente}
                                  onChange={(e) =>
                                    setEditing((s) => ({
                                      ...s,
                                      remanente: onlyDigits(e.target.value),
                                    }))
                                  }
                                  inputMode="numeric"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={cancelEdit}
                                    type="button"
                                    className="px-3 py-1 rounded border text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={saveEdit}
                                    type="button"
                                    className="px-3 py-1 rounded bg-green-700 text-white text-sm hover:bg-green-800"
                                  >
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center font-bold text-sm">
                        <span>TOTAL</span>
                        <span>{totalForSpecies}</span>
                      </div>
                    </div>

                    <div className="hidden sm:block space-y-4">
                      <div className="bg-white rounded-lg shadow-sm p-3 border">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                  Categoría
                                </th>
                                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                                  Cantidad
                                </th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                                  Acciones
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {species.categorias.map((item) => {
                                const itemId =
                                  resolveIdFromItem(item) ?? item.key;
                                const isEditing =
                                  editing.id &&
                                  String(editing.id) === String(itemId);
                                return (
                                  <tr
                                    key={item.key}
                                    className="border-t border-gray-200"
                                  >
                                    <td className="px-4 py-2 text-sm text-gray-800">
                                      {isEditing ? (
                                        <div className="space-y-2">
                                          <SelectField
                                            label="Especie (editar)"
                                            value={
                                              especiesOptions.find(
                                                (o) =>
                                                  String(o.value) ===
                                                  String(editing.id_especie)
                                              ) || null
                                            }
                                            onChange={(opt) =>
                                              setEditing((s) => ({
                                                ...s,
                                                id_especie: opt?.value ?? null,
                                              }))
                                            }
                                            options={especiesOptions}
                                            placeholder="— Seleccionar especie —"
                                            isClearable={false}
                                          />
                                          <SelectField
                                            selectKey={editing.selectKey}
                                            value={
                                              editing.selectedCategory
                                                ? editing.selectedCategory
                                                : (editCategoryOptions &&
                                                  editCategoryOptions.length > 0
                                                    ? editCategoryOptions
                                                    : categoryOptions
                                                  ).find(
                                                    (o) =>
                                                      String(o.value) ===
                                                      String(
                                                        editing.id_cat_especie
                                                      )
                                                  ) || null
                                            }
                                            onChange={(opt) =>
                                              setEditing((s) => ({
                                                ...s,
                                                id_cat_especie:
                                                  opt?.value ?? '',
                                                selectedCategory: opt ?? null,
                                              }))
                                            }
                                            options={
                                              editCategoryOptions.length > 0
                                                ? editCategoryOptions
                                                : categoryOptions
                                            }
                                            placeholder="— Seleccionar categoría —"
                                          />
                                        </div>
                                      ) : (
                                        item.nombre || item.key
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                      {isEditing ? (
                                        <input
                                          className={`${INPUT_BASE_CLASS} w-24 text-right`}
                                          value={editing.remanente}
                                          onChange={(e) =>
                                            setEditing((s) => ({
                                              ...s,
                                              remanente: onlyDigits(
                                                e.target.value
                                              ),
                                            }))
                                          }
                                          inputMode="numeric"
                                        />
                                      ) : (
                                        item.cantidad
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      {isEditing ? (
                                        <div className="flex justify-center gap-2">
                                          <button
                                            onClick={cancelEdit}
                                            type="button"
                                            className="px-3 py-1 border rounded text-sm"
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            onClick={saveEdit}
                                            type="button"
                                            className="px-3 py-1 bg-green-700 text-white rounded text-sm hover:bg-green-800"
                                          >
                                            Guardar
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex justify-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openEdit({
                                                ...item,
                                                id_tropa_detalle:
                                                  item.id_tropa_detalle,
                                                rawRows: item.rawRows,
                                              })
                                            }
                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                                          >
                                            Editar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openConfirmDelete({
                                                ...item,
                                                id_tropa_detalle:
                                                  item.id_tropa_detalle,
                                                rawRows: item.rawRows,
                                              })
                                            }
                                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                          >
                                            Eliminar
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="bg-gray-100 font-bold text-sm">
                                <td className="px-4 py-2">
                                  TOTAL {species.especie}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {totalForSpecies}
                                </td>
                                <td className="px-4 py-2" />
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Cargar Detalle por Especie
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <SelectField
                label="Especie"
                value={especieSeleccionada}
                onChange={(opt) => {
                  setEspecieSeleccionada(opt || null);
                  setNuevoDetalle({ id_cat_especie: '', cantidad: '' });
                }}
                options={especiesOptions}
                placeholder="— Seleccionar especie —"
                isClearable
              />
              <SelectField
                label="Categoría"
                value={
                  catalogoCategorias.find(
                    (c) =>
                      String(c.value) === String(nuevoDetalle.id_cat_especie)
                  ) || null
                }
                onChange={(opt) =>
                  setNuevoDetalle((s) => ({
                    ...s,
                    id_cat_especie: opt?.value ?? '',
                  }))
                }
                options={
                  catalogoCategorias.length > 0
                    ? catalogoCategorias
                    : categoryOptions
                }
                placeholder="— Seleccionar categoría —"
                isDisabled={!especieSeleccionada}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={nuevoDetalle.cantidad}
                  onChange={(e) =>
                    setNuevoDetalle((s) => ({
                      ...s,
                      cantidad: onlyDigits(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className={INPUT_BASE_CLASS}
                  disabled={!especieSeleccionada}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addBufferRow}
                className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800"
                disabled={!especieSeleccionada}
              >
                Agregar al detalle
              </button>
            </div>

            {bufferRows.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Detalle agregado
                </h3>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Especie
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                          Categoría
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                          Cantidad
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bufferRows.map((r) => (
                        <tr key={r.uid} className="border-t border-gray-200">
                          <td className="px-4 py-2">
                            <SelectField
                              label={null}
                              value={
                                especiesOptions.find(
                                  (o) =>
                                    String(o.value) === String(r.especie?.value)
                                ) ||
                                (r.especie
                                  ? {
                                      value: r.especie.value,
                                      label: r.especie.label,
                                    }
                                  : null)
                              }
                              onChange={(opt) =>
                                updateBufferRow(r.uid, {
                                  especie: opt
                                    ? { value: opt.value, label: opt.label }
                                    : null,
                                })
                              }
                              options={especiesOptions}
                              placeholder="— Seleccionar especie —"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <SelectField
                              value={
                                (r.catalogo && r.catalogo.length > 0
                                  ? r.catalogo
                                  : catalogoCategorias.length > 0
                                  ? catalogoCategorias
                                  : categoryOptions
                                ).find(
                                  (o) =>
                                    String(o.value) === String(r.id_cat_especie)
                                ) || null
                              }
                              onChange={(opt) =>
                                updateBufferRow(r.uid, {
                                  id_cat_especie: opt?.value ?? '',
                                })
                              }
                              options={
                                r.catalogo && r.catalogo.length > 0
                                  ? r.catalogo
                                  : catalogoCategorias.length > 0
                                  ? catalogoCategorias
                                  : categoryOptions
                              }
                              placeholder="— Seleccionar categoría —"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              className={`${INPUT_BASE_CLASS} w-24 text-right`}
                              type="text"
                              inputMode="numeric"
                              value={r.cantidad ?? 0}
                              onChange={(e) =>
                                updateBufferRow(r.uid, {
                                  cantidad:
                                    e.target.value === ''
                                      ? ''
                                      : Number(
                                          String(e.target.value).replace(
                                            /\D/g,
                                            ''
                                          )
                                        ),
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => removeBufferRow(r.uid)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden space-y-2">
                  {bufferRows.map((r) => (
                    <div
                      key={r.uid}
                      className="bg-gray-50 rounded-lg shadow p-3 flex flex-col gap-2"
                    >
                      <SelectField
                        label="Especie"
                        value={
                          especiesOptions.find(
                            (o) => String(o.value) === String(r.especie?.value)
                          ) ||
                          (r.especie
                            ? { value: r.especie.value, label: r.especie.label }
                            : null)
                        }
                        onChange={(opt) =>
                          updateBufferRow(r.uid, {
                            especie: opt
                              ? { value: opt.value, label: opt.label }
                              : null,
                          })
                        }
                        options={especiesOptions}
                        placeholder="— Seleccionar especie —"
                      />
                      <SelectField
                        value={
                          (r.catalogo && r.catalogo.length > 0
                            ? r.catalogo
                            : catalogoCategorias.length > 0
                            ? catalogoCategorias
                            : categoryOptions
                          ).find(
                            (o) => String(o.value) === String(r.id_cat_especie)
                          ) || null
                        }
                        onChange={(opt) =>
                          updateBufferRow(r.uid, {
                            id_cat_especie: opt?.value ?? '',
                          })
                        }
                        options={
                          r.catalogo && r.catalogo.length > 0
                            ? r.catalogo
                            : catalogoCategorias.length > 0
                            ? catalogoCategorias
                            : categoryOptions
                        }
                        placeholder="— Seleccionar categoría —"
                      />
                      <input
                        className={`${INPUT_BASE_CLASS}`}
                        type="text"
                        inputMode="numeric"
                        value={r.cantidad ?? 0}
                        onChange={(e) =>
                          updateBufferRow(r.uid, {
                            cantidad:
                              e.target.value === ''
                                ? ''
                                : Number(
                                    String(e.target.value).replace(/\D/g, '')
                                  ),
                          })
                        }
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => removeBufferRow(r.uid)}
                          className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800"
                    onClick={saveBufferAll}
                  >
                    Guardar detalle agregado
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border rounded text-sm"
                    onClick={() => setBufferRows([])}
                  >
                    Limpiar detalle agregado
                  </button>
                </div>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>

      {confirmDelete.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-30"
            onClick={cancelDelete}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold mb-3">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              ¿Eliminar "{confirmDelete.nombre}" de la tropa? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                type="button"
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteNow}
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow ${
            toast.type === 'success'
              ? 'bg-green-700 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

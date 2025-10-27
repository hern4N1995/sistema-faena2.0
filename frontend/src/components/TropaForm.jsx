import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';

/**
 * TropaForm.jsx
 * - No hay estados visuales de loading en botones (no quedan trabados)
 * - Al guardar muestra toast con resultado (success/error)
 * - Normaliza plantas a { id_planta, nombre }
 * - Modales crean registros, se cierran tras la respuesta y notifican al padre
 */

export default function TropaForm({ onCreated }) {
  const [form, setForm] = useState({
    fecha: '',
    dte_dtu: '',
    guia_policial: '',
    n_tropa: '',
    id_departamento: '',
    id_planta: '',
    id_productor: '',
    id_titular_faena: '',
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [plantas, setPlantas] = useState([]); // normalizado: { id_planta, nombre }
  const [productores, setProductores] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [provincias, setProvincias] = useState([]);

  const [toast, setToast] = useState(null); // { type, text }
  const toastTimer = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [plantaAsignada, setPlantaAsignada] = useState(null);

  const [modalFor, setModalFor] = useState(null); // 'departamento'|'productor'|'titular'
  const openerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadInitial();
    return () => {
      mountedRef.current = false;
      clearToast();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(type, text, ms = 3500) {
    clearToast();
    setToast({ type, text });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, ms);
  }
  function clearToast() {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }

  // ---------- loadInitial: normaliza respuestas ----------
  async function loadInitial() {
    try {
      const [userRes, depsRes, plantasRes, prodsRes, titsRes, provsRes] =
        await Promise.all([
          api.get('/usuario-actual').catch(() => ({ data: null })),
          api.get('/departamentos').catch(() => ({ data: [] })),
          api.get('/plantas').catch(() => ({ data: [] })),
          api.get('/productores').catch(() => ({ data: [] })),
          api.get('/titulares-faena').catch(() => ({ data: [] })),
          api.get('/provincias').catch(() => ({ data: [] })),
        ]);

      if (!mountedRef.current) return;

      setUsuario(userRes.data ?? null);

      const depsRaw = Array.isArray(depsRes.data) ? depsRes.data : [];
      const deps = depsRaw.map((d) => ({
        id_departamento: d.id_departamento ?? d.id ?? null,
        nombre_departamento:
          d.departamento ?? d.nombre_departamento ?? d.nombre ?? '',
        provincia: d.provincia ?? d.descripcion ?? '',
        id_provincia: d.id_provincia ?? null,
      }));

      const plsRaw = Array.isArray(plantasRes.data) ? plantasRes.data : [];
      const pls = plsRaw
        .map((p) => {
          const id = p.id_planta ?? p.id ?? p.planta_id ?? null;
          const nombre =
            p.nombre ??
            p.nombre_planta ??
            p.descripcion ??
            p.razon_social ??
            '';
          return {
            id_planta: id,
            nombre,
            id_provincia: p.id_provincia ?? null,
            provincia: p.provincia ?? p.descripcion ?? '',
          };
        })
        .filter((p) => p.id_planta != null);

      const prodsRaw = Array.isArray(prodsRes.data) ? prodsRes.data : [];
      const prods = prodsRaw.map((p) => ({
        id_productor: p.id_productor ?? p.id ?? null,
        nombre: p.nombre ?? p.razon_social ?? '',
        cuit: p.cuit ?? null,
      }));

      const titsRaw = Array.isArray(titsRes.data) ? titsRes.data : [];
      const tits = titsRaw.map((t) => ({
        id_titular_faena: t.id_titular_faena ?? t.id ?? null,
        nombre: t.nombre ?? '',
        localidad: t.localidad ?? '',
        provincia: t.provincia ?? t.descripcion ?? '',
        id_provincia: t.id_provincia ?? null,
      }));

      const provsRaw = Array.isArray(provsRes.data) ? provsRes.data : [];
      const provs = provsRaw.map((p) => ({
        id: p.id ?? p.id_provincia ?? null,
        descripcion: p.descripcion ?? p.nombre ?? '',
      }));

      setDepartamentos(deps);
      setPlantas(pls);
      setProductores(prods);
      setTitulares(tits);
      setProvincias(provs);

      if (userRes.data && userRes.data.id_planta != null) {
        const planta = pls.find(
          (p) => String(p.id_planta) === String(userRes.data.id_planta)
        );
        if (planta) {
          setPlantaAsignada(planta);
          setForm((prev) => ({ ...prev, id_planta: String(planta.id_planta) }));
        } else {
          setForm((prev) => ({
            ...prev,
            id_planta: String(userRes.data.id_planta),
          }));
        }
      }
    } catch (err) {
      console.error('loadInitial error', err);
      if (mountedRef.current)
        showToast('error', 'Error cargando listas. Reintentá.');
    }
  }

  // ---------- opciones para selects ----------
  const deptOptions = useMemo(
    () =>
      departamentos.map((d) => ({
        value: String(d.id_departamento ?? d.id ?? ''),
        label: `${d.nombre_departamento}${
          d.provincia ? ' — ' + d.provincia : ''
        }`,
      })),
    [departamentos]
  );

  const plantaOptions = useMemo(
    () =>
      plantas.map((p) => ({
        value: String(p.id_planta ?? p.id ?? ''),
        label: p.nombre || '',
      })),
    [plantas]
  );
  const prodOptions = useMemo(
    () =>
      productores.map((p) => ({
        value: String(p.id_productor ?? p.id ?? ''),
        label: p.nombre || '',
      })),
    [productores]
  );
  const titOptions = useMemo(
    () =>
      titulares.map((t) => ({
        value: String(t.id_titular_faena ?? t.id ?? ''),
        label: t.nombre || '',
      })),
    [titulares]
  );
  const provOptions = useMemo(
    () =>
      provincias.map((p) => ({
        value: String(p.id ?? ''),
        label: p.descripcion || '',
      })),
    [provincias]
  );

  // ---------- handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectNative = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  // Guardar tropa: no bloquea botones, muestra toast al resultado
  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      'dte_dtu',
      'guia_policial',
      'n_tropa',
      'id_departamento',
      'id_planta',
      'id_productor',
      'id_titular_faena',
    ];
    const missing = required.filter((k) => !form[k]);
    if (missing.length) {
      showToast('error', 'Completá todos los campos obligatorios.');
      return;
    }

    try {
      const res = await api.post('/tropas', form);
      if (res?.data?.id_tropa) {
        if (onCreated) onCreated(res.data.id_tropa);
        showToast('success', 'Tropa creada correctamente.');
        setForm({
          fecha: '',
          dte_dtu: '',
          guia_policial: '',
          n_tropa: '',
          id_departamento: '',
          id_planta: usuario?.id_planta ? String(usuario.id_planta) : '',
          id_productor: '',
          id_titular_faena: '',
        });
        return;
      }
      if (res?.status >= 200 && res.status < 300) {
        showToast('success', 'Tropa creada (respuesta sin id).');
        return;
      }
      showToast('error', 'Error al guardar tropa.');
    } catch (err) {
      console.error('guardar tropa error', err);
      showToast(
        'error',
        err?.response?.data?.error || 'Error al guardar tropa.'
      );
    }
  };

  const openModal = (type, opener) => {
    openerRef.current = opener || null;
    setModalFor(type);
  };

  // Al recibir objeto creado por modal: recarga, selecciona y muestra toast
  const handleCreatedModal = (type) => async (obj) => {
    try {
      // recargar listas desde BD
      await loadInitial();

      if (type === 'departamento') {
        const id = obj?.id_departamento ?? obj?.id;
        if (id) {
          setForm((f) => ({ ...f, id_departamento: String(id) }));
        } else {
          const name =
            obj?.nombre_departamento ?? obj?.departamento ?? obj?.nombre;
          if (name) {
            const found = departamentos.find(
              (d) =>
                String(d.nombre_departamento).trim().toLowerCase() ===
                String(name).trim().toLowerCase()
            );
            if (found)
              setForm((f) => ({
                ...f,
                id_departamento: String(found.id_departamento ?? found.id),
              }));
          }
        }
        showToast('success', 'Departamento guardado correctamente.');
      }

      if (type === 'productor') {
        const id = obj?.id_productor ?? obj?.id;
        if (id) setForm((f) => ({ ...f, id_productor: String(id) }));
        else {
          const found = productores.find(
            (p) =>
              (obj?.cuit &&
                String(p.cuit || '')
                  .trim()
                  .toLowerCase() ===
                  String(obj.cuit || '')
                    .trim()
                    .toLowerCase()) ||
              String(p.nombre).trim().toLowerCase() ===
                String(obj?.nombre || '')
                  .trim()
                  .toLowerCase()
          );
          if (found)
            setForm((f) => ({
              ...f,
              id_productor: String(found.id_productor ?? found.id),
            }));
        }
        showToast('success', 'Productor guardado correctamente.');
      }

      if (type === 'titular') {
        const id = obj?.id_titular_faena ?? obj?.id;
        if (id) setForm((f) => ({ ...f, id_titular_faena: String(id) }));
        else {
          const found = titulares.find(
            (t) =>
              String(t.nombre || '')
                .trim()
                .toLowerCase() ===
                String(obj?.nombre || '')
                  .trim()
                  .toLowerCase() &&
              (obj?.localidad
                ? String(t.localidad || '')
                    .trim()
                    .toLowerCase() ===
                  String(obj.localidad || '')
                    .trim()
                    .toLowerCase()
                : true)
          );
          if (found)
            setForm((f) => ({
              ...f,
              id_titular_faena: String(found.id_titular_faena ?? found.id),
            }));
        }
        showToast('success', 'Titular guardado correctamente.');
      }

      setModalFor(null);
      if (openerRef.current && openerRef.current.focus)
        openerRef.current.focus();
    } catch (err) {
      console.error('handleCreatedModal error', err);
      showToast('error', 'Creado, pero hubo un problema actualizando listas.');
      setModalFor(null);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-6"
      >
        {toast && (
          <div
            className={`text-sm text-center font-medium py-2 rounded ${
              toast.type === 'success'
                ? 'text-white bg-green-600'
                : 'text-white bg-red-600'
            }`}
          >
            {toast.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 text-sm">
              DTE/DTU
            </label>
            <input
              name="dte_dtu"
              value={form.dte_dtu}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 text-sm">
              Guía Policial
            </label>
            <input
              name="guia_policial"
              value={form.guia_policial}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 text-sm">
              N° Tropa
            </label>
            <input
              name="n_tropa"
              type="number"
              value={form.n_tropa}
              onChange={handleChange}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50"
            />
          </div>

          {/* Departamento */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 text-sm">
              Departamento
            </label>
            <div className="flex gap-2">
              <select
                name="id_departamento"
                value={form.id_departamento}
                onChange={handleSelectNative('id_departamento')}
                required
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="">Seleccione un departamento</option>
                {deptOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => openModal('departamento', e.currentTarget)}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                ➕
              </button>
            </div>
          </div>

          {/* Planta */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 text-sm">
              Planta
            </label>
            <div className="flex gap-2">
              <select
                name="id_planta"
                value={form.id_planta}
                onChange={handleSelectNative('id_planta')}
                required
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="">Seleccione una planta</option>
                {plantaOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {plantaAsignada
                ? `Planta asignada: ${plantaAsignada.nombre}`
                : 'Sin planta asignada'}
            </div>
          </div>

          {/* Productor */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 text-sm">
              Productor
            </label>
            <div className="flex gap-2">
              <select
                name="id_productor"
                value={form.id_productor}
                onChange={handleSelectNative('id_productor')}
                required
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="">Seleccione un productor</option>
                {prodOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => openModal('productor', e.currentTarget)}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                ➕
              </button>
            </div>
          </div>

          {/* Titular */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 text-sm">
              Titular Faena
            </label>
            <div className="flex gap-2">
              <select
                name="id_titular_faena"
                value={form.id_titular_faena}
                onChange={handleSelectNative('id_titular_faena')}
                required
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="">Seleccione un titular</option>
                {titOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => openModal('titular', e.currentTarget)}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                ➕
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#00902f] text-white py-2.5 rounded-md hover:bg-[#008d36]"
        >
          Siguiente
        </button>
      </form>

      {modalFor && (
        <Modal onClose={() => setModalFor(null)}>
          <InlineCreateModal
            type={modalFor}
            provincias={provincias}
            onCancel={() => setModalFor(null)}
            onCreated={handleCreatedModal(modalFor)}
          />
        </Modal>
      )}
    </>
  );
}

/* ---------- InlineCreateModal (sin bloqueo visual en botones) ---------- */
function InlineCreateModal({ type, provincias = [], onCancel, onCreated }) {
  const [values, setValues] = useState(() => {
    if (type === 'departamento')
      return { nombre_departamento: '', id_provincia: '' };
    if (type === 'productor') return { cuit: '', nombre: '' };
    if (type === 'titular')
      return {
        nombre: '',
        id_provincia: '',
        localidad: '',
        direccion: '',
        documento: '',
      };
    return {};
  });
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const [localProvincias, setLocalProvincias] = useState(provincias || []);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  useEffect(() => {
    if (Array.isArray(provincias) && provincias.length > 0) {
      setLocalProvincias(provincias);
      return;
    }
    let canceled = false;
    api
      .get('/provincias')
      .then((res) => {
        if (!canceled && Array.isArray(res.data)) setLocalProvincias(res.data);
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, [provincias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (type === 'departamento')
      return (
        values.nombre_departamento.trim().length >= 1 && values.id_provincia
      );
    if (type === 'productor') return values.nombre.trim().length > 0; // CUIT opcional según tu controller original
    if (type === 'titular')
      return (
        values.nombre.trim().length > 0 &&
        values.id_provincia &&
        values.localidad.trim().length > 0
      );
    return false;
  };

  const provOptions = useMemo(
    () =>
      (localProvincias || []).map((p) => ({
        value: String(p.id ?? p.id_provincia ?? ''),
        label: p.descripcion ?? p.nombre ?? '',
      })),
    [localProvincias]
  );

  const endpoint =
    type === 'departamento'
      ? '/departamentos'
      : type === 'productor'
      ? '/productores'
      : '/titulares-faena';
  const payload = () => {
    if (type === 'departamento')
      return {
        nombre_departamento: values.nombre_departamento.trim(),
        id_provincia: parseInt(values.id_provincia, 10),
      };
    if (type === 'productor')
      return { cuit: values.cuit || null, nombre: values.nombre.trim() };
    if (type === 'titular')
      return {
        nombre: values.nombre.trim(),
        id_provincia: parseInt(values.id_provincia, 10),
        localidad: values.localidad.trim(),
        direccion: values.direccion || null,
        documento: values.documento || null,
      };
    return {};
  };

  const handleCreate = async () => {
    if (!validate()) {
      setError('Completá los campos obligatorios correctamente.');
      return;
    }
    try {
      const res = await api.post(endpoint, payload());
      const data = res?.data;
      if (res.status >= 200 && res.status < 300) {
        // Notificar al padre y cerrar modal inmediatamente
        if (mounted.current && onCreated) {
          if (
            data &&
            (data.id_departamento ||
              data.id ||
              data.id_titular_faena ||
              data.id_productor)
          ) {
            await onCreated(data);
          } else {
            await onCreated({
              ...data,
              nombre: values.nombre,
              cuit: values.cuit || null,
              nombre_departamento: values.nombre_departamento || undefined,
            });
          }
        }
        onCancel();
        return;
      }
      setError(data?.error || data?.mensaje || 'Error creando');
    } catch (err) {
      console.error('POST modal error', err);
      setError(
        err?.response?.data?.error || err?.message || 'Error del servidor'
      );
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        {type === 'departamento'
          ? 'Crear Departamento'
          : type === 'productor'
          ? 'Crear Productor'
          : 'Crear Titular Faena'}
      </h3>

      {type === 'departamento' && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Provincia
          </label>
          <select
            name="id_provincia"
            value={values.id_provincia}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          >
            <option value="">Seleccione provincia</option>
            {provOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700">
            Nombre departamento
          </label>
          <input
            name="nombre_departamento"
            value={values.nombre_departamento}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />
        </>
      )}

      {type === 'productor' && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            CUIT (opcional)
          </label>
          <input
            name="cuit"
            value={values.cuit}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <label className="block text-sm font-medium text-gray-700">
            Nombre productor
          </label>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />
        </>
      )}

      {type === 'titular' && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Provincia
          </label>
          <select
            name="id_provincia"
            value={values.id_provincia}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          >
            <option value="">Seleccione provincia</option>
            {provOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700">
            Nombre titular
          </label>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />

          <label className="block text-sm font-medium text-gray-700">
            Localidad
          </label>
          <input
            name="localidad"
            value={values.localidad}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />

          <label className="block text-sm font-medium text-gray-700">
            Dirección (opcional)
          </label>
          <input
            name="direccion"
            value={values.direccion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />

          <label className="block text-sm font-medium text-gray-700">
            Documento (opcional)
          </label>
          <input
            name="documento"
            value={values.documento}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />
        </>
      )}

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Crear y seleccionar
        </button>
      </div>
    </div>
  );
}

/* ---------- Modal wrapper ---------- */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-10">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

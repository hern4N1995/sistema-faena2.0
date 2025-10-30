import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import api from '../services/api';

function SelectField({ label, value, onChange, options, placeholder }) {
  const [isFocusing, setIsFocusing] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      minHeight: '48px',
      paddingLeft: '16px',
      paddingRight: '16px',
      backgroundColor: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: isFocusing
        ? '0 0 0 1px #000'
        : state.isFocused
        ? '0 0 0 4px #d1fae5'
        : 'none',
      transition: 'all 50ms ease',
      '&:hover': { borderColor: '#96f1b7' },
      '&:focus-within': { borderColor: '#22c55e' },
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
    }),
    placeholder: (base) => ({ ...base, fontSize: '14px', color: '#6b7280' }),
    indicatorsContainer: (base) => ({ ...base, height: '48px' }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      fontSize: '14px',
      padding: '10px 16px',
      backgroundColor: isFocused ? '#d1fae5' : '#fff',
      color: isFocused ? '#065f46' : '#111827',
    }),
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 font-semibold text-gray-700 text-sm">
        {label}
      </label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        styles={customStyles}
        noOptionsMessage={() => 'Sin opciones'}
        components={{ IndicatorSeparator: () => null }}
        onFocus={() => {
          setIsFocusing(true);
          setTimeout(() => setIsFocusing(false), 50);
        }}
      />
    </div>
  );
}

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
  const [plantas, setPlantas] = useState([]);
  const [productores, setProductores] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [provincias, setProvincias] = useState([]);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [plantaAsignada, setPlantaAsignada] = useState(null);

  const [modalFor, setModalFor] = useState(null);
  const openerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadInitial();
    return () => {
      mountedRef.current = false;
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
        toastTimer.current = null;
      }
    };
  }, []);

  function showToast(type, text, ms = 3500) {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast({ type, text });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, ms);
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectNative = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleSelectChange = (name) => (selected) =>
    setForm((prev) => ({ ...prev, [name]: selected ? selected.value : '' }));

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
  // Cuando el modal crea un registro, actualizamos el estado local y seleccionamos el nuevo ítem
  // Reemplaza tu handleCreatedModal completa por esto
  const handleCreatedModal = (type) => async (obj) => {
    try {
      console.log('handleCreatedModal called with obj:', obj);

      const created = obj || {};

      if (type === 'departamento') {
        // normalizar
        const id = created.id_departamento ?? created.id ?? null;
        const nombre =
          created.nombre_departamento ??
          created.departamento ??
          created.nombre ??
          `Departamento ${Date.now()}`;
        const id_provincia = created.id_provincia ?? null;
        const finalId = id ? String(id) : `local-dep-${Date.now()}`;

        const newDep = {
          id_departamento: id ?? finalId,
          nombre_departamento: nombre,
          provincia: created.provincia ?? created.descripcion ?? '',
          id_provincia,
        };

        setDepartamentos((prev) => {
          const exists = prev.find(
            (p) =>
              String(p.id_departamento) === String(newDep.id_departamento) ||
              (newDep.nombre_departamento &&
                String(p.nombre_departamento).trim().toLowerCase() ===
                  String(newDep.nombre_departamento).trim().toLowerCase())
          );
          if (exists) return prev;
          return [...prev, newDep];
        });

        // forzamos selección: ponemos el id en form
        setForm((f) => ({
          ...f,
          id_departamento: String(newDep.id_departamento),
        }));
        console.log('departamentos updated, selecting:', newDep);
      }

      if (type === 'productor') {
        const id = created.id_productor ?? created.id ?? null;
        const nombre =
          created.nombre ?? created.razon_social ?? `Productor ${Date.now()}`;
        const cuit = created.cuit ?? null;
        const finalId = id ? String(id) : `local-prod-${Date.now()}`;

        const newProd = { id_productor: id ?? finalId, nombre, cuit };

        setProductores((prev) => {
          const exists = prev.find(
            (p) =>
              String(p.id_productor) === String(newProd.id_productor) ||
              (newProd.cuit && String(p.cuit) === String(newProd.cuit))
          );
          if (exists) return prev;
          return [...prev, newProd];
        });

        setForm((f) => ({ ...f, id_productor: String(newProd.id_productor) }));
        console.log('productores updated, selecting:', newProd);
      }

      if (type === 'titular') {
        const id = created.id_titular_faena ?? created.id ?? null;
        const nombre = created.nombre ?? `Titular ${Date.now()}`;
        const localidad = created.localidad ?? '';
        const finalId = id ? String(id) : `local-tit-${Date.now()}`;

        const newTit = {
          id_titular_faena: id ?? finalId,
          nombre,
          localidad,
          provincia: created.provincia ?? '',
        };

        setTitulares((prev) => {
          const exists = prev.find(
            (t) =>
              String(t.id_titular_faena) === String(newTit.id_titular_faena) ||
              (newTit.nombre &&
                String(t.nombre).trim().toLowerCase() ===
                  String(newTit.nombre).trim().toLowerCase())
          );
          if (exists) return prev;
          return [...prev, newTit];
        });

        setForm((f) => ({
          ...f,
          id_titular_faena: String(newTit.id_titular_faena),
        }));
        console.log('titulares updated, selecting:', newTit);
      }

      // Cerrar modal
      setModalFor(null);
      if (openerRef.current && openerRef.current.focus)
        openerRef.current.focus();
    } catch (err) {
      console.error('handleCreatedModal error', err);
      showToast(
        'error',
        'Creado, pero no se pudo actualizar la UI automáticamente.'
      );
      setModalFor(null);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 space-y-6"
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
          <SelectField
            label="Planta"
            value={
              plantaOptions.find((o) => o.value === form.id_planta) || null
            }
            onChange={(sel) => handleSelectChange('id_planta')(sel)}
            options={plantaOptions}
            placeholder="Seleccione una planta"
          />
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 text-sm">
              DTE/DTU
            </label>
            <input
              name="dte_dtu"
              value={form.dte_dtu}
              onChange={handleChange}
              required
              placeholder="Ej. 123456"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
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
              placeholder="Ej. 789456"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-3.5 font-semibold text-gray-700 text-sm">
              N° Tropa
            </label>
            <input
              name="n_tropa"
              type="number"
              value={form.n_tropa}
              onChange={handleChange}
              required
              placeholder="Ej. 1001"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-0">
              <label className="font-semibold text-gray-700 text-sm">
                Departamento
              </label>
              <button
                type="button"
                onClick={(e) => openModal('departamento', e.currentTarget)}
                className="text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                Agregar +
              </button>
            </div>
            <SelectField
              label=""
              value={
                deptOptions.find((o) => o.value === form.id_departamento) ||
                null
              }
              onChange={(sel) => handleSelectChange('id_departamento')(sel)}
              options={deptOptions}
              placeholder="Seleccione un departamento"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-0">
              <label className="font-semibold text-gray-700 text-sm">
                Productor
              </label>
              <button
                type="button"
                onClick={(e) => openModal('productor', e.currentTarget)}
                className="text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                Agregar +
              </button>
            </div>
            <SelectField
              label=""
              value={
                prodOptions.find((o) => o.value === form.id_productor) || null
              }
              onChange={(sel) => handleSelectChange('id_productor')(sel)}
              options={prodOptions}
              placeholder="Seleccione un productor"
            />
          </div>

          <div className="sm:col-span-1">
            <div className="flex justify-between items-center mb-0">
              <label className="font-semibold text-gray-700 text-sm">
                Titular Faena
              </label>
              <button
                type="button"
                onClick={(e) => openModal('titular', e.currentTarget)}
                className="text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-md text-xs font-medium hover:bg-green-200 transition focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                Agregar +
              </button>
            </div>
            <SelectField
              label=""
              value={
                titOptions.find((o) => o.value === form.id_titular_faena) ||
                null
              }
              onChange={(sel) => handleSelectChange('id_titular_faena')(sel)}
              options={titOptions}
              placeholder="Seleccione un titular"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#00902f] text-white py-2.5 rounded-md hover:bg-[#008d36] transition shadow mt-4"
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

/* InlineCreateModal estilizado (solo se cambió handleCreate para garantizar que onCreated reciba objeto útil) */
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
    if (type === 'productor') return values.nombre.trim().length > 0;
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
            // backend no devolvió id: enviar fallback con campos visibles para que el padre lo inserte localmente y lo seleccione
            const fallback = { ...payload() };
            if (type === 'departamento')
              fallback.nombre_departamento = values.nombre_departamento;
            if (type === 'productor') fallback.nombre = values.nombre;
            if (type === 'titular') fallback.nombre = values.nombre;
            await onCreated(fallback);
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
          <SelectField
            label=""
            value={
              provOptions.find((o) => o.value === values.id_provincia) || null
            }
            onChange={(sel) =>
              setValues((v) => ({ ...v, id_provincia: sel ? sel.value : '' }))
            }
            options={provOptions}
            placeholder="Seleccione provincia"
          />
          <label className="block text-sm font-medium text-gray-700 mt-3">
            Nombre departamento
          </label>
          <input
            name="nombre_departamento"
            value={values.nombre_departamento}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mt-1"
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
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mb-2"
          />
          <label className="block text-sm font-medium text-gray-700">
            Nombre productor
          </label>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mb-2"
          />
        </>
      )}

      {type === 'titular' && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Provincia
          </label>
          <SelectField
            label=""
            value={
              provOptions.find((o) => o.value === values.id_provincia) || null
            }
            onChange={(sel) =>
              setValues((v) => ({ ...v, id_provincia: sel ? sel.value : '' }))
            }
            options={provOptions}
            placeholder="Seleccione provincia"
          />
          <label className="block text-sm font-medium text-gray-700 mt-3">
            Nombre titular
          </label>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mb-2 mt-1"
          />
          <label className="block text-sm font-medium text-gray-700">
            Localidad
          </label>
          <input
            name="localidad"
            value={values.localidad}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mb-2"
          />
          <label className="block text-sm font-medium text-gray-700">
            Dirección (opcional)
          </label>
          <input
            name="direccion"
            value={values.direccion}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mb-2"
          />
          <label className="block text-sm font-medium text-gray-700">
            Documento (opcional)
          </label>
          <input
            name="documento"
            value={values.documento}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 mb-2"
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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Crear y seleccionar
        </button>
      </div>
    </div>
  );
}

/* Modal wrapper */
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

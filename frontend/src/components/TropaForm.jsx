import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import api from '../services/api';

/**
 * TropaForm.jsx - versión que usa endpoints /tropas/*
 * - GET  /tropas/departamentos, /tropas/plantas, /tropas/productores, /tropas/titulares, /tropas/provincias
 * - POST /tropas/departamentos, /tropas/productores, /tropas/titulares, /tropas (crear tropa)
 * - Modal inline para crear Departamento / Productor / Titular Faena
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
  const [plantas, setPlantas] = useState([]);
  const [productores, setProductores] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [provincias, setProvincias] = useState([]);

  const [loading, setLoading] = useState(false);
  const [guiaFocus, setGuiaFocus] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [modalFor, setModalFor] = useState(null);

  const openerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();
    loadProvincias();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    try {
      const [depRes, plRes, prodRes, titRes] = await Promise.all([
        api.get('/tropas/departamentos'),
        api.get('/tropas/plantas'),
        api.get('/tropas/productores'),
        api.get('/tropas/titulares'),
      ]);
      if (!mountedRef.current) return;
      setDepartamentos(Array.isArray(depRes.data) ? depRes.data : []);
      setPlantas(Array.isArray(plRes.data) ? plRes.data : []);
      setProductores(Array.isArray(prodRes.data) ? prodRes.data : []);
      setTitulares(Array.isArray(titRes.data) ? titRes.data : []);
    } catch (err) {
      console.error('Error al cargar listas:', err);
      if (mountedRef.current)
        setFeedback('Error al cargar listas. Recargá la página.');
    }
  }

  async function loadProvincias() {
    try {
      const res = await api.get('/tropas/provincias');
      if (!mountedRef.current) return;
      setProvincias(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar provincias:', err);
    }
  }

  const toOption = (item, key, label) => ({
    value: item[key],
    label: item[label],
  });
  const valueFor = (list, id) => list.find((i) => i.value === id) || null;
  const validarDteDtu = (v) => /^[0-9\-\/]*$/.test(v);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dte_dtu' && !validarDteDtu(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (selected) =>
    setForm((prev) => ({ ...prev, [name]: selected ? selected.value : '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      'fecha',
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
      alert('Completá todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/tropas', form);
      if (res?.data?.id_tropa) {
        if (onCreated) onCreated(res.data.id_tropa);
        setForm({
          fecha: '',
          dte_dtu: '',
          guia_policial: '',
          n_tropa: '',
          id_departamento: '',
          id_planta: '',
          id_productor: '',
          id_titular_faena: '',
        });
        setFeedback('✅ Tropa guardada correctamente');
        setTimeout(() => setFeedback(''), 3000);
        alert('Tropa guardada correctamente');
      } else {
        alert('Tropa guardada (respuesta inesperada)');
      }
    } catch (err) {
      console.error('Error al guardar tropa:', err);
      alert(err?.response?.data?.error || 'Error al guardar tropa.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const maxMenuHeight = useMemo(() => {
    const w = window.innerWidth;
    if (w < 480) return 100;
    if (w < 768) return 140;
    return 180;
  }, []);

  const deptOptions = useMemo(
    () =>
      departamentos.map((d) =>
        toOption(d, 'id_departamento', 'nombre_departamento')
      ),
    [departamentos]
  );
  const plantaOptions = useMemo(
    () => plantas.map((p) => toOption(p, 'id_planta', 'nombre')),
    [plantas]
  );
  const prodOptions = useMemo(
    () => productores.map((p) => toOption(p, 'id_productor', 'nombre')),
    [productores]
  );
  const titOptions = useMemo(
    () => titulares.map((t) => toOption(t, 'id_titular_faena', 'nombre')),
    [titulares]
  );
  const provOptions = useMemo(
    () => provincias.map((p) => toOption(p, 'id', 'descripcion')),
    [provincias]
  );

  const openModal = (type, opener) => {
    openerRef.current = opener || null;
    setModalFor(type);
  };

  const handleCreatedModal = (type) => async (obj) => {
    try {
      await loadAll();
      if (type === 'departamento') {
        const createdId = obj?.id_departamento || obj?.id;
        if (createdId) setForm((f) => ({ ...f, id_departamento: createdId }));
        setFeedback('Departamento creado y seleccionado');
      }
      if (type === 'productor') {
        if (obj?.id_productor || obj?.id) {
          const createdId = obj.id_productor || obj.id;
          setForm((f) => ({ ...f, id_productor: createdId }));
        } else {
          await loadAll();
          const found = productores.find(
            (p) =>
              String(p.nombre).toLowerCase() ===
              String(obj?.nombre || '').toLowerCase()
          );
          if (found)
            setForm((f) => ({
              ...f,
              id_productor: found.id_productor || found.id,
            }));
        }
        setFeedback('Productor creado y seleccionado');
      }
      if (type === 'titular') {
        if (obj?.id_titular_faena || obj?.id) {
          const createdId = obj.id_titular_faena || obj.id;
          setForm((f) => ({ ...f, id_titular_faena: createdId }));
        } else {
          await loadAll();
          const found = titulares.find(
            (t) =>
              String(t.nombre).toLowerCase() ===
              String(obj?.nombre || '').toLowerCase()
          );
          if (found)
            setForm((f) => ({
              ...f,
              id_titular_faena: found.id_titular_faena || found.id,
            }));
        }
        setFeedback('Titular creado y seleccionado');
      }
      setModalFor(null);
      if (openerRef.current && openerRef.current.focus)
        openerRef.current.focus();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Error tras creación:', err);
      setFeedback('Creado, pero hubo un problema actualizando listas.');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6 border border-gray-100"
      >
        {feedback && (
          <div className="text-sm text-center font-medium text-white bg-green-600 py-2 rounded">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <InputField
            label="Fecha Ingreso"
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            required
          />
          <InputField
            label="DTE/DTU"
            name="dte_dtu"
            value={form.dte_dtu}
            onChange={handleChange}
            required
          />
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 text-sm">
              Guía Policial
            </label>
            <input
              type="text"
              name="guia_policial"
              value={form.guia_policial}
              onChange={handleChange}
              onFocus={() => setGuiaFocus(true)}
              onBlur={() => setGuiaFocus(false)}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
            />
            {guiaFocus && (
              <span className="text-red-600 text-xs mt-1">
                Si no posee guía policial, colocar 000
              </span>
            )}
          </div>

          <InputField
            label="N° Tropa"
            name="n_tropa"
            type="number"
            value={form.n_tropa}
            onChange={handleChange}
            required
          />

          <div className="flex items-center gap-2">
            <SelectField
              label="Departamento"
              value={valueFor(deptOptions, form.id_departamento)}
              onChange={handleSelectChange('id_departamento')}
              options={deptOptions}
              placeholder="Seleccione un departamento"
              maxMenuHeight={maxMenuHeight}
              required
            />
            <button
              type="button"
              onClick={(e) => openModal('departamento', e.currentTarget)}
              className="text-green-600 text-sm font-semibold hover:underline"
            >
              ➕
            </button>
          </div>

          <SelectField
            label="Planta"
            value={valueFor(plantaOptions, form.id_planta)}
            onChange={handleSelectChange('id_planta')}
            options={plantaOptions}
            placeholder="Seleccione una planta"
            maxMenuHeight={maxMenuHeight}
            required
          />

          <div className="flex items-center gap-2">
            <SelectField
              label="Productor"
              value={valueFor(prodOptions, form.id_productor)}
              onChange={handleSelectChange('id_productor')}
              options={prodOptions}
              placeholder="Seleccione un productor"
              maxMenuHeight={maxMenuHeight}
              required
            />
            <button
              type="button"
              onClick={(e) => openModal('productor', e.currentTarget)}
              className="text-green-600 text-sm font-semibold hover:underline"
            >
              ➕
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SelectField
              label="Titular Faena"
              value={valueFor(titOptions, form.id_titular_faena)}
              onChange={handleSelectChange('id_titular_faena')}
              options={titOptions}
              placeholder="Seleccione un titular"
              maxMenuHeight={maxMenuHeight}
              required
            />
            <button
              type="button"
              onClick={(e) => openModal('titular', e.currentTarget)}
              className="text-green-600 text-sm font-semibold hover:underline"
            >
              ➕
            </button>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md transition transform hover:scale-105 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Guardando...' : 'Siguiente'}
          </button>
        </div>
      </form>

      {modalFor && (
        <ModalAccessible
          onClose={() => {
            setModalFor(null);
            if (openerRef.current && openerRef.current.focus)
              openerRef.current.focus();
          }}
        >
          <InlineCreateModal
            type={modalFor}
            provincias={provincias}
            onCancel={() => setModalFor(null)}
            onCreated={handleCreatedModal(modalFor)}
          />
        </ModalAccessible>
      )}
    </>
  );
}

/* ---------- ModalAccessible ---------- */
function ModalAccessible({ children, onClose }) {
  const modalRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousActive = document.activeElement;
    setTimeout(() => {
      const focusable = modalRef.current?.querySelector(
        'input,button,select,textarea,a[href]'
      );
      if (focusable) focusable.focus();
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previousActive && previousActive.focus) previousActive.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 p-5 z-60"
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- InlineCreateModal ---------- */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const [localProvincias, setLocalProvincias] = useState(provincias || []);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  // Si la prop provincias viene vacía, intentar cargar desde la API de tropa/provincias
  useEffect(() => {
    let canceled = false;
    async function ensureProvincias() {
      if (Array.isArray(provincias) && provincias.length > 0) {
        setLocalProvincias(provincias);
        return;
      }
      try {
        const res = await api
          .get('/api/provincias')
          .catch(() => api.get('/tropas/provincias'));
        if (!canceled && Array.isArray(res?.data)) setLocalProvincias(res.data);
      } catch (e) {
        console.warn('No se pudieron cargar provincias en modal:', e);
      }
    }
    ensureProvincias();
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
        values.nombre_departamento.trim().length >= 3 && values.id_provincia
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

  // construir options de provincia robustos (soportando id o id_provincia en la respuesta)
  const provOptions = useMemo(() => {
    return (localProvincias || []).map((p) => {
      const id = p.id ?? p.id_provincia;
      const label = p.descripcion ?? p.nombre ?? '';
      return { value: id, label };
    });
  }, [localProvincias]);

  const endpoint =
    type === 'departamento'
      ? '/tropas/departamentos'
      : type === 'productor'
      ? '/tropas/productores'
      : '/tropas/titulares';
  const payload = () => {
    if (type === 'departamento')
      return {
        nombre_departamento: values.nombre_departamento.trim(),
        id_provincia: parseInt(values.id_provincia, 10),
      };
    if (type === 'productor')
      return { cuit: values.cuit || '', nombre: values.nombre.trim() };
    if (type === 'titular')
      return {
        nombre: values.nombre.trim(),
        id_provincia: parseInt(values.id_provincia, 10),
        localidad: values.localidad.trim(),
        direccion: values.direccion ? values.direccion.trim() : null,
        documento: values.documento ? values.documento.trim() : null,
      };
    return {};
  };

  const handleCreate = async () => {
    if (!validate()) {
      setError('Completá los campos obligatorios correctamente.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const data = await res.json();

      if (
        res.ok &&
        data &&
        (data.id ||
          data.id_departamento ||
          data.id_productor ||
          data.id_titular_faena)
      ) {
        if (mounted.current && onCreated) onCreated(data);
        alert(
          (type === 'productor'
            ? 'Productor'
            : type === 'departamento'
            ? 'Departamento'
            : 'Titular') + ' creado correctamente'
        );
        return;
      }

      if (res.status === 201 || res.status === 200) {
        if (mounted.current && onCreated)
          onCreated({ nombre: values.nombre, ...data });
        alert('Creado correctamente');
        return;
      }

      if (res.status === 409 && data?.existing) {
        alert('Ya existe un registro igual; se seleccionará automáticamente.');
        if (mounted.current && onCreated) onCreated(data.existing);
        return;
      }

      const msg = data?.error || data?.mensaje || 'Error al crear';
      setError(msg);
      alert(msg);
    } catch (err) {
      console.error('Error en POST modal:', err);
      setError('Error del servidor. Podés reintentar.');
      alert('Error del servidor. Podés reintentar.');
    } finally {
      if (mounted.current) setLoading(false);
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
            Nombre productor
          </label>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <label className="block text-sm font-medium text-gray-700">
            CUIT (opcional)
          </label>
          <input
            name="cuit"
            value={values.cuit}
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
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Crear y seleccionar'}
        </button>
      </div>
    </div>
  );
}

/* ---------- SelectField ---------- */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxMenuHeight,
  required = false,
}) {
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
        maxMenuHeight={maxMenuHeight}
        required={required}
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

/* ---------- InputField ---------- */
function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 font-semibold text-gray-700 text-sm">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
      />
    </div>
  );
}

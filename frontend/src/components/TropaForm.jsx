import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Select from 'react-select';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, plRes, prodRes, titRes] = await Promise.all([
          api.get('/tropas/departamentos'),
          api.get('/tropas/plantas'),
          api.get('/tropas/productores'),
          api.get('/tropas/titulares'),
        ]);
        setDepartamentos(depRes.data);
        setPlantas(plRes.data);
        setProductores(prodRes.data);
        setTitulares(titRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    fetchData();
  }, []);

  const toOption = (item, key, label) => ({
    value: item[key],
    label: item[label],
  });
  const valueFor = (list, id) => list.find((i) => i.value === id) || null;

  const maxMenuHeight = useMemo(() => {
    const width = window.innerWidth;
    if (width < 480) return 100;
    if (width < 768) return 140;
    return 180;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (selected) => {
    setForm((prev) => ({ ...prev, [name]: selected ? selected.value : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const camposObligatorios = [
      'fecha',
      'dte_dtu',
      'guia_policial',
      'n_tropa',
      'id_departamento',
      'id_planta',
      'id_productor',
      'id_titular_faena',
    ];
    const faltantes = camposObligatorios.filter((c) => !form[c]);
    if (faltantes.length) {
      alert('Completá todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/tropas', form);
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
    } catch (err) {
      alert('Error al guardar tropa.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6 border border-gray-100"
    >
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
        <InputField
          label="Guía Policial"
          name="guia_policial"
          value={form.guia_policial}
          onChange={handleChange}
          required
        />
        <InputField
          label="N° Tropa"
          name="n_tropa"
          type="number"
          value={form.n_tropa}
          onChange={handleChange}
          required
        />

        <SelectField
          label="Departamento"
          value={valueFor(deptOptions, form.id_departamento)}
          onChange={handleSelectChange('id_departamento')}
          options={deptOptions}
          placeholder="Seleccione un departamento"
          maxMenuHeight={maxMenuHeight}
          required
        />
        <SelectField
          label="Planta"
          value={valueFor(plantaOptions, form.id_planta)}
          onChange={handleSelectChange('id_planta')}
          options={plantaOptions}
          placeholder="Seleccione una planta"
          maxMenuHeight={maxMenuHeight}
          required
        />
        <SelectField
          label="Productor"
          value={valueFor(prodOptions, form.id_productor)}
          onChange={handleSelectChange('id_productor')}
          options={prodOptions}
          placeholder="Seleccione un productor"
          maxMenuHeight={maxMenuHeight}
          required
        />
        <SelectField
          label="Titular Faena"
          value={valueFor(titOptions, form.id_titular_faena)}
          onChange={handleSelectChange('id_titular_faena')}
          options={titOptions}
          placeholder="Seleccione un titular"
          maxMenuHeight={maxMenuHeight}
          required
        />
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              />
              Guardando...
            </span>
          ) : (
            'Siguiente'
          )}
        </button>
      </div>
    </form>
  );
}

/* ---------- SelectField con estilos idénticos a inputs ---------- */
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
        ? '0 0 0 1px #000' // ✅ borde negro fino (1px)
        : state.isFocused
        ? '0 0 0 4px #d1fae5' // ✅ mismo tono que ring-green-100
        : 'none',
      transition: 'all 100ms ease',
      '&:hover': {
        borderColor: '#6ee7b7',
      },
      '&:focus-within': {
        borderColor: '#10b981',
      },
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
    indicatorsContainer: (base) => ({
      ...base,
      height: '48px',
    }),
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

/* ---------- InputField sin cambios ---------- */
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

import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TropaForm({ onCreated }) {
  const [form, setForm] = useState({
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
        console.error(
          'Error al cargar datos:',
          err.response?.data || err.message
        );
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validación previa
    const camposObligatorios = [
      'dte_dtu',
      'guia_policial',
      'n_tropa',
      'id_departamento',
      'id_planta',
      'id_productor',
      'id_titular_faena',
    ];

    const faltantes = camposObligatorios.filter((campo) => !form[campo]);

    if (faltantes.length > 0) {
      alert('Completá todos los campos obligatorios antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/tropas', form);
      if (onCreated) onCreated(res.data.id_tropa);
      setForm({
        dte_dtu: '',
        guia_policial: '',
        n_tropa: '',
        id_departamento: '',
        id_planta: '',
        id_productor: '',
        id_titular_faena: '',
      });
    } catch (err) {
      console.error(
        'Error al guardar tropa:',
        err.response?.data || err.message
      );
      alert('Error al guardar tropa. Verificá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {/* DTE/DTU */}
        <InputField
          label="DTE/DTU"
          name="dte_dtu"
          value={form.dte_dtu}
          onChange={handleChange}
          required
        />

        {/* Guía Policial */}
        <InputField
          label="Guía Policial"
          name="guia_policial"
          value={form.guia_policial}
          onChange={handleChange}
          required
        />

        {/* N° Tropa */}
        <InputField
          label="N° Tropa"
          name="n_tropa"
          type="number"
          value={form.n_tropa}
          onChange={handleChange}
          required
        />

        {/* Departamento */}
        <SelectField
          label="Departamento"
          name="id_departamento"
          value={form.id_departamento}
          onChange={handleChange}
          options={departamentos}
          optionKey="id_departamento"
          optionLabel="nombre_departamento"
          placeholder="Seleccione un departamento"
          required
        />

        {/* Planta */}
        <SelectField
          label="Planta"
          name="id_planta"
          value={form.id_planta}
          onChange={handleChange}
          options={plantas}
          optionKey="id_planta"
          optionLabel="nombre"
          placeholder="Seleccione una planta"
          required
        />

        {/* Productor */}
        <SelectField
          label="Productor"
          name="id_productor"
          value={form.id_productor}
          onChange={handleChange}
          options={productores}
          optionKey="id_productor"
          optionLabel="nombre"
          placeholder="Seleccione un productor"
          required
        />

        {/* Titular Faena */}
        <SelectField
          label="Titular Faena"
          name="id_titular_faena"
          value={form.id_titular_faena}
          onChange={handleChange}
          options={titulares}
          optionKey="id_titular_faena"
          optionLabel="nombre"
          placeholder="Seleccione un titular"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-[#00902f] text-white py-2 rounded transition ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#008d36]'
        }`}
      >
        {loading ? 'Guardando...' : 'Siguiente'}
      </button>
    </form>
  );
}

// 🔧 Componentes reutilizables

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
      <label className="mb-1 font-medium text-gray-700 text-sm">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  optionKey,
  optionLabel,
  placeholder,
  required = false,
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 font-medium text-gray-700 text-sm">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">{placeholder}</option>
        {options.length > 0 ? (
          options.map((opt) => (
            <option key={opt[optionKey]} value={opt[optionKey]}>
              {opt[optionLabel]}
            </option>
          ))
        ) : (
          <option disabled>Cargando...</option>
        )}
      </select>
    </div>
  );
}

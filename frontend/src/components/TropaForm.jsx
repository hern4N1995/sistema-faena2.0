/*
import React, { useState } from 'react';
import api from '../services/api';

export default function TropaForm({ onCreated }) {
  const [generalData, setGeneralData] = useState({
    fecha: '',
    dte: '',
    guiaPolicial: '',
    nroTropa: '',
    guiaExtendida: '',
    procedencia: '',
    titular: '',
  });

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/tropas', generalData);
      console.log('Tropa creada:', res.data);

      if (onCreated) onCreated(res.data);

      setGeneralData({
        fecha: '',
        dte: '',
        guiaPolicial: '',
        nroTropa: '',
        guiaExtendida: '',
        procedencia: '',
        titular: '',
      });
    } catch (err) {
      console.error('Error al guardar tropa:', err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {[
          { label: 'Fecha', name: 'fecha', type: 'date' },
          { label: 'DTE/DTU', name: 'dte' },
          { label: 'Nº Guía Policial', name: 'guiaPolicial' },
          { label: 'Nº Tropa', name: 'nroTropa' },
          { label: 'Guía Extendida Por', name: 'guiaExtendida' },
          { label: 'Procedencia', name: 'procedencia' },
          { label: 'Titular Faena', name: 'titular' },
        ].map(({ label, name, type = 'text' }) => (
          <div key={name} className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 text-sm">
              {label}
            </label>
            <input
              type={type}
              name={name}
              value={generalData[name]}
              onChange={handleGeneralChange}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-[#00902f] text-white py-2 rounded hover:bg-[#008d36] transition"
      >
        GUARDAR
      </button>
    </form>
  );
}
*/

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depRes, plRes, prodRes, titRes] = await Promise.all([
          api.get('/tropa/departamentos'),
          api.get('/tropa/plantas'),
          api.get('/tropa/productores'),
          api.get('/tropa/titulares'),
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
      console.log('Payload enviado:', form);
    } catch (err) {
      console.error(
        'Error al guardar tropa:',
        err.response?.data || err.message
      );
      alert('Error al guardar tropa. Verificá los datos.');
    }
  };
  console.log('Departamentos cargados:', departamentos);
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {/* DTE/DTU */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            DTE/DTU
          </label>
          <input
            type="text"
            name="dte_dtu"
            value={form.dte_dtu}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Guía Policial */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            Guía Policial
          </label>
          <input
            type="text"
            name="guia_policial"
            value={form.guia_policial}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* N° Tropa */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            N° Tropa
          </label>
          <input
            type="number"
            name="n_tropa"
            value={form.n_tropa}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Departamento */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            Departamento
          </label>
          <select
            name="id_departamento"
            value={form.id_departamento}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Seleccione un departamento</option>
            {departamentos.map((d) => (
              <option key={d.id_departamento} value={d.id_departamento}>
                {d.nombre_departamento}
              </option>
            ))}
          </select>
        </div>

        {/* Planta */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            Planta
          </label>
          <select
            name="id_planta"
            value={form.id_planta}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Seleccionar</option>
            {plantas.map((pl) => (
              <option key={pl.id_planta} value={pl.id_planta}>
                {pl.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Productor */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            Productor
          </label>
          <select
            name="id_productor"
            value={form.id_productor}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {productores.map((p) => (
              <option key={p.id_productor} value={p.id_productor}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Titular Faena */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 text-sm">
            Titular Faena
          </label>
          <select
            name="id_titular_faena"
            value={form.id_titular_faena}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {titulares.map((t) => (
              <option key={t.id_titular_faena} value={t.id_titular_faena}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#00902f] text-white py-2 rounded hover:bg-[#008d36] transition"
      >
        GUARDAR TROPA
      </button>
    </form>
  );
}

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

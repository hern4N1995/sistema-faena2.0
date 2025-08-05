// DecomisosPage.jsx

import React, { useState } from 'react';
import Layout from "../components/Layout.jsx";

const diseaseCategories = [
  {
    category: 'CISTICERCOSIS',
    subcategories: ['Cabezas', 'Corazones', 'Animales afectados'],
  },
  {
    category: 'TUBERCULOSIS',
    subcategories: [
      'Pulmones',
      'Hígados',
      'Rúmen',
      'Mesentéricos',
      'Medias reses',
      'Cabezas',
      'Cuartos',
      'Riñones',
      'Otros órganos',
      'Animales afectados',
    ],
  },
  {
    category: 'FETOS',
    subcategories: ['Sin pelo', 'Con pelo'],
  },
  {
    category: 'DISTOMASTOSIS',
    subcategories: ['Hígados', 'Vesícula', 'Otros'],
  },
  {
    category: 'HEMOSIDEROSIS',
    subcategories: ['HEMOSIDEROSIS'],
  },
  {
    category: 'ESOFAGOMASTOSIS',
    subcategories: ['ESOFAGOMASTOSIS'],
  },
  {
    category: 'HIDATIDOSIS',
    subcategories: [
      'Pulmones',
      'Hígados',
      'Corazones',
      'Riñones',
      'Animales afectados',
    ],
  },
  {
    category: 'OTROS DECOMISOS',
    subcategories: [
      'Contusos: Cuarto anterior',
      'Contusos: Cuarto posterior',
      'Contusos: Media reses',
      'Contusos: Animales afectados',
      'Hígado con absceso',
      'Hígado hemorrágico',
      'Hígado hepatitis',
      'Librillo con abscesos',
      'Mastitis',
      'Pulmón con abscesos',
      'Pulmón con adherencias',
      'Pulmón congestivo',
      'Riñón atrofiado',
      'Riñón con abscesos',
      'Riñón con nefritis',
      'Riñón con piel o nefritis',
      'Rúmen con abscesos',
      'Rúmenitis',
      'Animal muerto en camión',
      'Ascariosis',
      'Hidronefrosis',
      'Triquinosis',
      'Erisipela',
      'Neumonía',
      'Ictericia hepática',
    ],
  },
];

const DecomisosPage = () => {
  const [dte, setDte] = useState('');
  const [validDte, setValidDte] = useState(false);
  const [error, setError] = useState('');

  // Initialize nested disease data
  const initData = {};
  diseaseCategories.forEach(({ category, subcategories }) => {
    initData[category] = {};
    subcategories.forEach((sub) => {
      initData[category][sub] = '';
    });
  });
  const [diseasesData, setDiseasesData] = useState(initData);

  // Observations state
  const [observations, setObservations] = useState([
    { id: 1, text: '' },
  ]);

  const handleSearch = async () => {
    if (!dte.trim()) return;
    setError('');
    try {
      const res = await fetch(`/api/tropas/${dte}`);
      if (!res.ok) throw new Error('No existe el DTE');
      setValidDte(true);
    } catch (err) {
      setError(err.message);
      setValidDte(false);
    }
  };

  const handleCountChange = (cat, sub, value) => {
    setDiseasesData((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [sub]: value },
    }));
  };

  const addObservation = () => {
    setObservations((prev) => [
      ...prev,
      { id: Date.now(), text: '' },
    ]);
  };

  const removeObservation = (id) => {
    setObservations((prev) =>
      prev.filter((obs) => obs.id !== id)
    );
  };

  const handleObsChange = (id, text) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === id ? { ...obs, text } : obs
      )
    );
  };

  const handleSave = async () => {
    const payload = {
      dte,
      decomisos: diseasesData,
      observaciones: observations.map((o) => o.text).filter(Boolean),
    };
    try {
      const res = await fetch('/api/decomisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al guardar');
      alert('Datos guardados correctamente');
      // reset form if needed
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout>
      <h1 className="text-black text-2xl text-center font-bold px-4 py-2">
          🧬 DECOMISOS 🦠
        </h1>
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* DTE Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ingrese DTE"
          value={dte}
          onChange={(e) => setDte(e.target.value)}
          className="border rounded px-3 py-2 flex-grow"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Buscar
        </button>
      </div>
      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {/* Diseases Table */}
      {validDte && (
        <>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Categoría</th>
                <th className="border px-4 py-2">Subcategoría</th>
                <th className="border px-4 py-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {diseaseCategories.map(
                ({ category, subcategories }) =>
                  subcategories.map((sub, i) => (
                    <tr key={category + sub}>
                      <td className="border px-4 py-2">
                        {i === 0 ? category : ''}
                      </td>
                      <td className="border px-4 py-2">
                        {sub}
                      </td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={
                            diseasesData[category][sub]
                          }
                          onChange={(e) =>
                            handleCountChange(
                              category,
                              sub,
                              e.target.value
                            )
                          }
                          className="w-20 border rounded px-2 py-1"
                        />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Observations */}
          <div>
            <h2 className="font-medium mb-2">
              Observaciones
            </h2>
            <div className="space-y-2">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={obs.text}
                    onChange={(e) =>
                      handleObsChange(
                        obs.id,
                        e.target.value
                      )
                    }
                    className="border rounded px-3 py-2 flex-grow"
                    placeholder="Escriba la observación…"
                  />
                  <button
                    onClick={() =>
                      removeObservation(obs.id)
                    }
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button
                onClick={addObservation}
                className="text-blue-600 hover:underline"
              >
                + Agregar observación
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="text-right">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Guardar
            </button>
          </div>
        </>
      )}
    </div>
    </Layout>
  );
};

export default DecomisosPage;

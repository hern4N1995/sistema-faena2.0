import React, { useState, useEffect } from 'react';

const DetalleFaenaForm = ({ modo = 'crear', faena = {}, onSubmit }) => {
  const [fecha, setFecha] = useState('');
  const [faenaPorCategoria, setFaenaPorCategoria] = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (modo === 'editar' && faena) {
      setFecha(faena.fecha || '');
    }
  }, [modo, faena]);

  const handleCantidadChange = (categoriaNombre, value) => {
    const remanente =
      faena.categorias.find((cat) => cat.nombre === categoriaNombre)
        ?.remanente || 0;
    const cantidad = Math.min(parseInt(value) || 0, remanente); // no más que el remanente
    setFaenaPorCategoria((prev) => ({
      ...prev,
      [categoriaNombre]: cantidad,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fecha) {
      setFeedback('⚠️ La fecha es obligatoria');
      return;
    }

    const detalles = Object.entries(faenaPorCategoria).map(
      ([nombre, cantidad]) => ({
        nombre_categoria: nombre,
        cantidad,
      })
    );

    setFeedback('✅ Datos listos para enviar');
    onSubmit({ fecha, especie: faena.especie, detalles });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fecha arriba */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">
          Fecha de faena:
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-auto"
        />
      </div>

      {/* Categorías dinámicas */}
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          Categorías a faenar:
        </label>
        <div className="space-y-3">
          {faena.categorias.map((cat, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-3 rounded"
            >
              <span className="font-medium w-1/3">{cat.nombre}</span>
              <input
                type="number"
                value={cat.remanente}
                readOnly
                className="w-20 text-right bg-white border border-gray-300 rounded px-2 py-1 mr-2"
                title="Remanente disponible"
              />
              <input
                type="number"
                min={0}
                max={cat.remanente}
                value={faenaPorCategoria[cat.nombre] || ''}
                onChange={(e) =>
                  handleCantidadChange(cat.nombre, e.target.value)
                }
                className="w-24 text-right border border-gray-300 rounded px-2 py-1"
                placeholder="A faenar"
              />
            </div>
          ))}
        </div>
      </div>

      {feedback && <div className="text-sm text-blue-600">{feedback}</div>}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {modo === 'editar' ? 'Actualizar faena' : 'Crear faena'}
      </button>
    </form>
  );
};

export default DetalleFaenaForm;

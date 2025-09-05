import React, { useState, useEffect } from 'react';

const DetalleFaenaForm = ({ modo = 'crear', faena = {}, onSubmit }) => {
  const [fecha, setFecha] = useState('');
  const [faenaPorCategoria, setFaenaPorCategoria] = useState({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (modo === 'editar' && faena.fecha) setFecha(faena.fecha);
  }, [modo, faena]);

  const handleCantidadChange = (nom, val) => {
    const max = faena.categorias?.find((c) => c.nombre === nom)?.remanente ?? 0;
    const cant = Math.min(parseInt(val) || 0, max);
    setFaenaPorCategoria((p) => ({ ...p, [nom]: cant }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fecha) return setFeedback('⚠️ La fecha es obligatoria');
    const detalles = Object.entries(faenaPorCategoria).map(([n, c]) => ({
      nombre_categoria: n,
      cantidad: c,
    }));
    setFeedback('✅ Datos listos para enviar');
    onSubmit({ fecha, especie: faena.especie, detalles });
  };

  /* ---------- UI ---------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Fecha */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Fecha de faena
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="w-full md:w-auto rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Categorías a faenar
        </label>

        {/* Desktop: tabla */}
        <div className="hidden md:block overflow-x-auto rounded-xl ring-1 ring-slate-200">
          <table className="min-w-[700px] w-full text-sm text-left text-slate-700">
            <thead className="bg-green-700 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Remanente</th>
                <th className="px-4 py-3 text-right">A faenar</th>
              </tr>
            </thead>
            <tbody>
              {faena.categorias?.map((cat) => (
                <tr
                  key={cat.nombre}
                  className="bg-white border-b hover:bg-green-50"
                >
                  <td className="px-4 py-3 font-medium">{cat.nombre}</td>
                  <td className="px-4 py-3 text-right">{cat.remanente}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      max={cat.remanente}
                      value={faenaPorCategoria[cat.nombre] || ''}
                      onChange={(e) =>
                        handleCantidadChange(cat.nombre, e.target.value)
                      }
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: tarjetas */}
        <div className="md:hidden space-y-3">
          {faena.categorias?.map((cat) => (
            <div
              key={cat.nombre}
              className="bg-white rounded-xl shadow border border-slate-200 p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-800">
                  {cat.nombre}
                </span>
                <span className="text-sm text-slate-500">
                  Remanente: <b>{cat.remanente}</b>
                </span>
              </div>
              <label className="block text-xs text-slate-500 mb-1">
                A faenar
              </label>
              <input
                type="number"
                min={0}
                max={cat.remanente}
                value={faenaPorCategoria[cat.nombre] || ''}
                onChange={(e) =>
                  handleCantidadChange(cat.nombre, e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          {feedback}
        </div>
      )}

      {/* Botón principal */}
      <button
        type="submit"
        className="w-full md:w-auto px-6 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
      >
        {modo === 'editar' ? 'Actualizar faena' : 'Crear faena'}
      </button>
    </form>
  );
};

export default DetalleFaenaForm;

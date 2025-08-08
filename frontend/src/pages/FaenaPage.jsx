import React, { useEffect, useState } from 'react';

const FaenaPage = () => {
  const [tropas, setTropas] = useState([]);
  const [fecha, setFecha] = useState('');
  const [titularSeleccionado, setTitularSeleccionado] = useState('');
  const [titulares, setTitulares] = useState([]);

  useEffect(() => {
    fetchTitulares();
    fetchTropas();
  }, []);

  const fetchTitulares = async () => {
    try {
      const res = await fetch('/api/titulares'); // Ajustar según tu backend
      const data = await res.json();
      setTitulares(data);
    } catch (err) {
      console.error('Error al cargar titulares', err);
    }
  };

  const fetchTropas = async () => {
    try {
      const res = await fetch('/api/faena/tropas');
      const data = await res.json();
      const ordenadas = data.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setTropas(ordenadas);
    } catch (err) {
      console.error('Error al cargar tropas', err);
    }
  };

  const handleFiltrar = () => {
    let tropasFiltradas = tropas;

    if (fecha) {
      tropasFiltradas = tropasFiltradas.filter((t) => t.fecha === fecha);
    }

    if (titularSeleccionado) {
      tropasFiltradas = tropasFiltradas.filter(
        (t) => t.titular_faena === titularSeleccionado
      );
    }

    setTropas(tropasFiltradas);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tropas Cargadas</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Titular Faena</label>
          <select
            value={titularSeleccionado}
            onChange={(e) => setTitularSeleccionado(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Seleccionar titular --</option>
            {titulares.map((t) => (
              <option key={t.id} value={t.nombre}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          onClick={handleFiltrar}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border rounded shadow">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">DTE/DTU</th>
              <th className="px-4 py-2 text-left">Guía Policial</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Guía Extendida Por</th>
              <th className="px-4 py-2 text-left">Procedencia</th>
              <th className="px-4 py-2 text-left">Titular Faena</th>
            </tr>
          </thead>
          <tbody>
            {tropas.map((tropa) => (
              <tr key={tropa.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{tropa.fecha}</td>
                <td className="px-4 py-2">{tropa.dte_dtu}</td>
                <td className="px-4 py-2">{tropa.guia_policial}</td>
                <td className="px-4 py-2">{tropa.usuario}</td>
                <td className="px-4 py-2">{tropa.guia_extendida_por}</td>
                <td className="px-4 py-2">{tropa.procedencia}</td>
                <td className="px-4 py-2">{tropa.titular_faena}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FaenaPage;

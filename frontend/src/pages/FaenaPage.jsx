import React, { useEffect, useState } from 'react';

const FaenaPage = () => {
  const [tropas, setTropas] = useState([]);

  useEffect(() => {
    fetchTropas();
  }, []);

  const fetchTropas = async () => {
    try {
      const res = await fetch('/api/faena/tropas');
      const data = await res.json();
      // Ordenar por fecha descendente
      const ordenadas = data.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setTropas(ordenadas);
    } catch (err) {
      console.error('Error al cargar tropas', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tropas Cargadas</h1>
      <div className="overflow-x-auto">
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

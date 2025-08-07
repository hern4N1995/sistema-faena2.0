// RemanentesPage.jsx
import React, { useEffect, useState } from 'react';

const RemanentesPage = () => {
  const [tropas, setTropas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTropas = async () => {
      try {
        const res = await fetch('/api/tropas');
        if (!res.ok) throw new Error('Error al obtener tropas');
        const data = await res.json();
        setTropas(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTropas();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Remanentes de Tropas</h1>
      {error && <p className="text-red-600">{error}</p>}
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Fecha Ingreso</th>
            <th className="border px-4 py-2">DTE</th>
            <th className="border px-4 py-2">Nro Usuario</th>
            <th className="border px-4 py-2">Procedencia</th>
            <th className="border px-4 py-2">Total Ingresado</th>
            <th className="border px-4 py-2">Faenados</th>
            <th className="border px-4 py-2">Remanente</th>
          </tr>
        </thead>
        <tbody>
          {tropas.map((tropa) => (
            <tr key={tropa.dte}>
              <td className="border px-4 py-2">{tropa.fechaIngreso}</td>
              <td className="border px-4 py-2">{tropa.dte}</td>
              <td className="border px-4 py-2">{tropa.nroUsuario}</td>
              <td className="border px-4 py-2">{tropa.procedencia}</td>
              <td className="border px-4 py-2">{tropa.cantidadIngresada}</td>
              <td className="border px-4 py-2">{tropa.cantidadFaenada}</td>
              <td className="border px-4 py-2 font-semibold">
                {tropa.cantidadIngresada - tropa.cantidadFaenada}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RemanentesPage;

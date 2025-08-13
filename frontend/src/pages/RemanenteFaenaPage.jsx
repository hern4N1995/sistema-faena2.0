import { useState } from 'react';
import axios from 'axios';

export default function RemanenteFaenaPage() {
  const [nTropa, setNTropa] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  const handleBuscar = async () => {
    setError('');
    setDatos(null);

    if (!nTropa.trim()) {
      setError('Ingresá un número de tropa válido');
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/faena/remanente?n_tropa=${nTropa}`
      );
      if (!res.data || !res.data.animales) {
        setError('No se encontraron datos para esa tropa');
        return;
      }
      setDatos(res.data);
    } catch (err) {
      setError('Error al buscar remanente');
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Consulta de Remanente</h1>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          value={nTropa}
          onChange={(e) => {
            setNTropa(e.target.value);
            setError('');
          }}
          placeholder="Número de tropa"
          className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleBuscar}
          className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36]"
        >
          Buscar
        </button>
      </div>

      {error && (
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded">{error}</div>
      )}

      {datos && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="bg-gray-100 rounded p-3">
              <strong>Tropa:</strong> {datos.n_tropa}
            </div>
            <div className="bg-gray-100 rounded p-3">
              <strong>Fecha:</strong> {datos.fecha}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(datos.animales).map(([grupo, categorias]) => (
              <div key={grupo}>
                <h3 className="text-xl font-semibold mb-2">{grupo}</h3>
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-1 text-left">Categoría</th>
                      <th className="border px-3 py-1 text-center">Faenados</th>
                      <th className="border px-3 py-1 text-center">
                        Remanente
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(categorias)
                      .filter(([cat]) => cat !== 'TOTAL')
                      .map(([cat, valores]) => (
                        <tr key={cat}>
                          <td className="border px-3 py-1 bg-gray-50">{cat}</td>
                          <td className="border px-3 py-1 text-center">
                            {valores.faenados}
                          </td>
                          <td className="border px-3 py-1 text-center">
                            {valores.remanente}
                          </td>
                        </tr>
                      ))}
                    {categorias.TOTAL && (
                      <tr className="font-semibold bg-green-100">
                        <td className="border px-3 py-1">TOTAL</td>
                        <td className="border px-3 py-1 text-center">
                          {categorias.TOTAL.faenados}
                        </td>
                        <td className="border px-3 py-1 text-center">
                          {categorias.TOTAL.remanente}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

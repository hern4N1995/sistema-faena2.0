import React, { useState } from 'react';
import Layout from '../components/Layout.jsx';

export default function Faenados() {
  const [dte, setDte] = useState('');
  const [faena, setFaena] = useState(null);
  const [registro, setRegistro] = useState(null);

  const buscarTropa = () => {
    const data = localStorage.getItem(`tropa-${dte}`);
    if (!data) return alert('No se encontró esa tropa');

    const ingreso = JSON.parse(data);

    const nuevoRegistro = Object.fromEntries(
      Object.entries(ingreso.datos).map(([grupo, categorias]) => {
        const sinTotal = Object.fromEntries(
          Object.entries(categorias)
            .filter(([key]) => key !== 'TOTAL')
            .map(([cat]) => [cat, ''])
        );
        return [grupo, { ...sinTotal, TOTAL: 0 }];
      })
    );

    setFaena(ingreso);
    setRegistro(nuevoRegistro);
  };

  const actualizar = (grupo, categoria, valor) => {
    setRegistro(prev => {
      const actualizado = { ...prev[grupo], [categoria]: valor };
      const total = Object.entries(actualizado)
        .filter(([k]) => k !== 'TOTAL')
        .reduce((sum, [, val]) => sum + (parseInt(val, 10) || 0), 0);

      return {
        ...prev,
        [grupo]: { ...actualizado, TOTAL: total },
      };
    });
  };

  const guardarFaenados = () => {
    localStorage.setItem(`faena-${dte}`, JSON.stringify(registro));
    alert("Faena guardada correctamente");
  };

  // 🟢 Aquí envolvés solo el JSX en Layout
  return (
    <Layout>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
        <h1 className="text-2xl font-bold mb-4">Registrar Faena</h1>
        <input
          value={dte}
          onChange={e => setDte(e.target.value)}
          className="border px-4 py-2 rounded w-full"
          placeholder="Ingrese DTE/DTU"
        />
        <button
          onClick={buscarTropa}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Buscar Tropa
        </button>

        {registro && (
          <>
            <h2 className="text-xl font-semibold mt-4">Ingreso de Faena</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(registro).map(([grupo, categorias]) => (
                <div key={grupo}>
                  <h3 className="text-lg font-bold mb-2">{grupo}</h3>
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-3 py-1">Categoría</th>
                        <th className="border px-3 py-1">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categorias).filter(([k]) => k !== 'TOTAL').map(([cat, val]) => (
                        <tr key={cat}>
                          <td className="border px-3 py-1 bg-gray-300">{cat}</td>
                          <td className="border px-3 py-1 bg-gray-300 text-right">
                            <input
                              type="number"
                              min="0"
                              value={val}
                              onChange={e => actualizar(grupo, cat, e.target.value)}
                              className="w-20 bg-gray-200 border-none rounded px-2 py-1 text-right"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-300">
                        <td className="border px-3 py-1">TOTAL</td>
                        <td className="border px-3 py-1 text-right">{registro[grupo].TOTAL}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <button
              onClick={guardarFaenados}
              className="mt-4 w-full bg-[#00902f] text-white py-2 rounded hover:bg-[#008d36]"
            >
              Guardar Faena
            </button>
          </>
        )}
      </div>
    </Layout>
  );
}

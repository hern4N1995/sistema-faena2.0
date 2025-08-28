import React, { useEffect, useState } from 'react';

const FaenaPage = () => {
  const [tropas, setTropas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchTropas();
  }, []);

  const normalizarFecha = (f) =>
    f ? new Date(f).toISOString().split('T')[0] : '—';

  const handleVerDetalle = (id) => {
    window.location.href = `/tropa/${id}/detalle`;
  };

  const handleEditar = (id) => {
    window.location.href = `/tropa/${id}/editar`;
  };

  const handleFaenar = (id) => {
    window.location.href = `/faena/${id}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tropas Cargadas</h1>

      {loading ? (
        <div className="text-center text-gray-500 mt-4">Cargando tropas...</div>
      ) : tropas.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">
          No hay tropas cargadas aún.
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border rounded shadow">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">DTE/DTU</th>
                <th className="px-4 py-2 text-left">Guía Policial</th>
                <th className="px-4 py-2 text-left">Nº Tropa</th>
                <th className="px-4 py-2 text-left">Productor</th>
                <th className="px-4 py-2 text-left">Departamento</th>
                <th className="px-4 py-2 text-left">Planta</th>
                <th className="px-4 py-2 text-left">Titular Faena</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tropas.map((tropa) => (
                <tr key={tropa.id_tropa} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{normalizarFecha(tropa.fecha)}</td>
                  <td className="px-4 py-2">{tropa.dte_dtu || '—'}</td>
                  <td className="px-4 py-2">{tropa.guia_policial || '—'}</td>
                  <td className="px-4 py-2">{tropa.n_tropa || '—'}</td>
                  <td className="px-4 py-2">{tropa.productor || '—'}</td>
                  <td className="px-4 py-2">{tropa.departamento || '—'}</td>
                  <td className="px-4 py-2">{tropa.planta || '—'}</td>
                  <td className="px-4 py-2">{tropa.titular_faena || '—'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleVerDetalle(tropa.id_tropa)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditar(tropa.id_tropa)}
                      className="text-yellow-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleFaenar(tropa.id_tropa)}
                      className="text-green-600 hover:underline"
                    >
                      Faenar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FaenaPage;

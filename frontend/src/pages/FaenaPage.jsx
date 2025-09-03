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
    f ? new Date(f).toLocaleDateString('es-AR') : '—';

  const actions = [
    {
      label: 'Ver',
      fn: (id) => (window.location.href = `/tropa/${id}/detalle`),
      color: 'text-blue-600',
    },
    {
      label: 'Editar',
      fn: (id) => (window.location.href = `/tropa/${id}/editar`),
      color: 'text-yellow-600',
    },
    {
      label: 'Faenar',
      fn: (id) => (window.location.href = `/faena/${id}`),
      color: 'text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Tropas Cargadas
        </h1>
        {loading ? (
          <p className="text-center text-gray-500">Cargando tropas…</p>
        ) : tropas.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay tropas cargadas aún.
          </p>
        ) : (
          <>
            {/* Vista cards en móvil */}
            <div className="grid grid-cols-1 sm:hidden gap-4">
              {tropas.map((tropa) => (
                <div
                  key={tropa.id_tropa}
                  className="bg-white rounded-xl shadow-md p-4 space-y-2"
                >
                  <p>
                    <strong>Fecha:</strong> {normalizarFecha(tropa.fecha)}
                  </p>
                  <p>
                    <strong>DTE/DTU:</strong> {tropa.dte_dtu || '—'}
                  </p>
                  <p>
                    <strong>Guía Policial:</strong> {tropa.guia_policial || '—'}
                  </p>
                  <p>
                    <strong>Nº Tropa:</strong> {tropa.n_tropa || '—'}
                  </p>
                  <p>
                    <strong>Productor:</strong> {tropa.productor || '—'}
                  </p>
                  <p>
                    <strong>Departamento:</strong> {tropa.departamento || '—'}
                  </p>
                  <p>
                    <strong>Titular Faena:</strong> {tropa.titular_faena || '—'}
                  </p>
                  <p>
                    <strong>Especie:</strong> {tropa.especie || '—'}
                  </p>
                  <p>
                    <strong>Total a Faenar:</strong>{' '}
                    {tropa.total_a_faenar ?? '—'}
                  </p>

                  <div className="flex gap-2 pt-2 border-t">
                    {actions.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => a.fn(tropa.id_tropa)}
                        className={`flex-1 py-2 text-sm font-medium rounded ${a.color} hover:underline`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                <th className="px-4 py-2 text-left">Titular Faena</th>
                <th className="px-4 py-2 text-left">Especie</th>
                <th className="px-4 py-2 text-left">Total tropa</th>
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
                  <td className="px-4 py-2">{tropa.titular_faena || '—'}</td>
                  <td className="px-4 py-2">{tropa.especie || '—'}</td>
                  <td className="px-4 py-2">{tropa.total_a_faenar ?? '—'}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleFaenar(tropa.id_tropa)}
                      className="text-green-600 hover:underline"
                    >
                      Faenar
                    </button>
                  </td>
                </tr>
              ))}
            </div>

            {/* Vista tabla en sm+ */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-md">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      DTE/DTU
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Guía Policial
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Nº Tropa
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Productor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Titular Faena
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Especie
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Total a Faenar
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tropas.map((tropa) => (
                    <tr
                      key={tropa.id_tropa}
                      className="border-b hover:bg-gray-100"
                    >
                      <td className="px-4 py-2 text-sm">
                        {normalizarFecha(tropa.fecha)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.dte_dtu || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.guia_policial || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.n_tropa || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.productor || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.departamento || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.titular_faena || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.especie || '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {tropa.total_a_faenar ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-sm space-x-2">
                        {actions.map((a) => (
                          <button
                            key={a.label}
                            onClick={() => a.fn(tropa.id_tropa)}
                            className={`hover:underline ${a.color}`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FaenaPage;

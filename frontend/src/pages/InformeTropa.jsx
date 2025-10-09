import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function InformeTropa() {
  const { id } = useParams();
  const [tropaInfo, setTropaInfo] = useState({});
  const [detalle, setDetalle] = useState({
    especie: '',
    categorias: [],
    n_tropa: '',
    fecha: '',
    dte_dtu: '',
    titular: '',
  });

  useEffect(() => {
    api
      .get(`/tropas/${id}/detalle-agrupado`)
      .then((res) => setDetalle(res.data))
      .catch(() =>
        setDetalle({
          especie: '',
          categorias: [],
          n_tropa: '',
          fecha: '',
          dte_dtu: '',
          titular: '',
        })
      );
  }, [id]);

  const { especie, categorias, n_tropa, fecha, dte_dtu, titular } = detalle;
  const totalEspecie = Array.isArray(categorias)
    ? categorias.reduce((acc, i) => acc + (Number(i.remanente) || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Título principal */}
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          📄 Informe de Tropa
        </h1>

        {/* Datos generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Nº Tropa', value: n_tropa },
            {
              label: 'Fecha',
              value: fecha ? new Date(fecha).toLocaleDateString('es-AR') : '—',
            },
            { label: 'DTE/DTU', value: dte_dtu },
            { label: 'Titular', value: titular || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={value || ''}
                disabled
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-800 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Detalle agrupado */}
        {!Array.isArray(categorias) || categorias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500">
              No se han registrado animales en esta tropa.
            </p>
          </div>
        ) : (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{especie}</h2>

            {/* Móvil: cards */}
            <div className="sm:hidden space-y-3">
              {categorias.map((item) => (
                <div
                  key={item.nombre}
                  className="bg-white rounded-lg shadow p-4 flex justify-between items-center border border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.nombre}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.remanente}
                  </span>
                </div>
              ))}
              <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center font-bold text-sm border border-gray-200">
                <span>TOTAL {especie}</span>
                <span>{totalEspecie}</span>
              </div>
            </div>

            {/* Escritorio: tabla */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((item) => (
                    <tr key={item.nombre} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {item.nombre}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {item.remanente}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold text-sm border-t border-gray-300">
                    <td className="px-4 py-3">TOTAL {especie}</td>
                    <td className="px-4 py-3 text-right">{totalEspecie}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

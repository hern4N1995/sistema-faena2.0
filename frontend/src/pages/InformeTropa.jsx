import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function InformeTropa() {
  const { id } = useParams();
  const [tropaInfo, setTropaInfo] = useState({});
  const [detalle, setDetalle] = useState([]);

  useEffect(() => {
    api.get(`/tropas/${id}`).then((res) => setTropaInfo(res.data));
    api.get(`/tropas/${id}/detalle`).then((res) => setDetalle(res.data));
  }, [id]);

  const agrupado = detalle.reduce((acc, item) => {
    if (!item.nombre_especie || !item.nombre_categoria) return acc;
    if (!acc[item.nombre_especie]) acc[item.nombre_especie] = [];
    acc[item.nombre_especie].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">
          📄 Informe de Tropa
        </h1>

        {/* Datos generales — SIEMPRE visibles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Nº Tropa', value: tropaInfo.n_tropa },
            {
              label: 'Fecha',
              value: tropaInfo.fecha
                ? new Date(tropaInfo.fecha).toLocaleDateString('es-AR')
                : '—',
            },
            { label: 'DTE/DTU', value: tropaInfo.dte_dtu },
            { label: 'Titular', value: tropaInfo.titular },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                {label}
              </p>
              <p className="text-sm sm:text-base text-gray-800 font-medium">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Detalle por especie — solo si hay animales */}
        {Object.keys(agrupado).length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500">
              No se han registrado animales en esta tropa.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(agrupado).map(([especie, items]) => {
              const totalEspecie = items.reduce(
                (acc, i) => acc + i.cantidad,
                0
              );
              return (
                <section key={especie}>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                    {especie}
                  </h2>

                  {/* Móvil: cards */}
                  <div className="sm:hidden space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id_tropa_detalle}
                        className="bg-white rounded-lg shadow p-3 flex justify-between items-center"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {item.nombre_categoria}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {item.cantidad}
                        </span>
                      </div>
                    ))}
                    <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center font-bold text-sm">
                      <span>TOTAL {especie}</span>
                      <span>{totalEspecie}</span>
                    </div>
                  </div>

                  {/* sm+: tabla */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full bg-white rounded-xl shadow-md">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Categoría
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                            Cantidad
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id_tropa_detalle}
                            className="border-t border-gray-200"
                          >
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {item.nombre_categoria}
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                              {item.cantidad}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100 font-bold text-sm">
                          <td className="px-4 py-2">TOTAL {especie}</td>
                          <td className="px-4 py-2 text-right">
                            {totalEspecie}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

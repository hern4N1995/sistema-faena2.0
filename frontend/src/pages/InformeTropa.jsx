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
    <div className="min-h-screen bg-gray-100 py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">
        📄 Informe de Tropa
      </h2>

      {/* Datos generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700 mb-8">
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            ID Tropa
          </label>
          <div className="bg-gray-100 px-3 py-2 rounded">
            {tropaInfo.id_tropa}
          </div>
        </div>
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Fecha
          </label>
          <div className="bg-gray-100 px-3 py-2 rounded">
            {tropaInfo.fecha
              ? new Date(tropaInfo.fecha).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '—'}
          </div>
        </div>
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            DTE/DTU
          </label>
          <div className="bg-gray-100 px-3 py-2 rounded">
            {tropaInfo.dte_dtu}
          </div>
        </div>
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Titular
          </label>
          <div className="bg-gray-100 px-3 py-2 rounded">
            {tropaInfo.titular}
          </div>
        </div>
      </div>

      {/* Detalle por especie */}
      {Object.entries(agrupado).map(([especie, items]) => (
        <div key={especie} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{especie}</h3>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-1">Categoría</th>
                <th className="border px-3 py-1">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id_tropa_detalle}>
                  <td className="border px-3 py-1">{item.nombre_categoria}</td>
                  <td className="border px-3 py-1 text-right">
                    {item.cantidad}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-300">
                <td className="border px-3 py-1">TOTAL</td>
                <td className="border px-3 py-1 text-right">
                  {items.reduce((acc, i) => acc + i.cantidad, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

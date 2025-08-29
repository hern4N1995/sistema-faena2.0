import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import DetalleEspecieForm from '../components/DetalleEspecieForm';

export default function DetalleTropa() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [tropaInfo, setTropaInfo] = useState({
    fecha: '',
    dte: '',
    titular: '',
    productor: '',
    planta: '',
  });

  useEffect(() => {
    api
      .get(`/tropas/${id}`)
      .then((res) => {
        const { n_tropa, dte_dtu, fecha, titular, planta, productor } =
          res.data;
        setTropaInfo({
          numero_tropa: n_tropa || '',
          dte: dte_dtu || '',
          fecha: fecha || '',
          titular: titular || '',
          planta: planta || '',
          productor: productor || '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando detalle de tropa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
          Detalle de Tropa
        </h1>

        {/* Planta */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={tropaInfo.planta?.nombre || tropaInfo.planta || ''}
            disabled
            className="text-lg sm:text-xl font-semibold text-center bg-gray-50 border-none rounded-lg px-4 py-2 w-full max-w-xs"
          />
        </div>

        {/* Productor */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Productor
          </label>
          <input
            type="text"
            value={tropaInfo.productor}
            disabled
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-800"
          />
        </div>

        {/* Datos de la tropa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Nº Tropa
            </label>
            <input
              type="text"
              value={tropaInfo.numero_tropa}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-800"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={tropaInfo.fecha}
              onChange={(e) =>
                setTropaInfo((prev) => ({ ...prev, fecha: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              DTE/DTU
            </label>
            <input
              type="text"
              value={tropaInfo.dte}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-800"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Titular
            </label>
            <input
              type="text"
              value={tropaInfo.titular}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-800"
            />
          </div>
        </div>

        {/* Formulario de especies */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Cargar Detalle por Especie
          </h2>
          <DetalleEspecieForm idTropa={id} />
        </div>
      </div>
    </div>
  );
}

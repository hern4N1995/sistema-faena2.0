import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import DetalleEspecieForm from '../components/DetalleEspecieForm';

export default function DetalleTropa() {
  const { id } = useParams();
  const [tropaInfo, setTropaInfo] = useState({
    fecha: '',
    dte: '',
    titular: '',
    productor: '',
    planta: '',
  });

  useEffect(() => {
    api.get(`/tropas/${id}`).then((res) => {
      const { n_tropa, dte_dtu, fecha, titular, planta, productor } = res.data;
      setTropaInfo({
        numero_tropa: n_tropa || '',
        dte: dte_dtu || '',
        fecha: fecha || '',
        titular: titular || '',
        planta: planta || '',
        productor: productor || '',
      });
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Detalle de Tropa</h2>

      <div className="flex justify-center my-4">
        <input
          type="text"
          value={tropaInfo.planta?.nombre || tropaInfo.planta || ''}
          disabled
          className="text-xl text-center font-semibold bg-gray-100 px-6 py-3"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 bg-white rounded shadow p-3">
        <label className="block font-semibold text-gray-600 mb-1">
          Productor
        </label>
        <input
          type="text"
          value={tropaInfo.productor}
          disabled
          className="w-full border rounded px-3 py-2 bg-gray-100"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Nº Tropa
          </label>
          <input
            type="text"
            value={id}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={tropaInfo.fecha}
            onChange={(e) =>
              setTropaInfo((prev) => ({ ...prev, fecha: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            DTE/DTU
          </label>
          <input
            type="text"
            value={tropaInfo.dte}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Titular
          </label>
          <input
            type="text"
            value={tropaInfo.titular}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
      </div>

      {/* Formulario dinámico de especies y categorías */}
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-xl font-bold mb-4">Cargar Detalle por Especie</h3>
        <DetalleEspecieForm idTropa={id} />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TropaForm from '../components/TropaForm.jsx';
import api from '../services/api.js';

export default function Tropa() {
  const [tropas, setTropas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/tropas')
      .then((res) => setTropas(res.data))
      .catch((err) => console.error('Error al obtener tropas:', err));
  }, []);

  const handleCreated = (id_tropa) => {
    navigate(`/tropa/detalle/${id_tropa}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">
        🐄 Registro de Tropas
      </h2>

      <div className="bg-white p-6 rounded shadow mb-10">
        <TropaForm onCreated={handleCreated} />
      </div>

      <h3 className="text-xl font-semibold mb-4">📋 Tropas registradas</h3>
      <ul className="space-y-3">
        {tropas.map((tropa) => (
          <li
            key={tropa.id_tropa}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">
                Titular: {tropa.titular || '—'}
              </div>
              <div className="text-sm text-gray-600">
                Tropa Nº {tropa.n_tropa} | DTE: {tropa.dte_dtu}
              </div>
              <div className="text-sm text-gray-600">
                Productor: {tropa.productor_nombre || '—'}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {tropa.fecha
                ? new Date(tropa.fecha).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '—'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate(`/tropa/detalle/${tropa.id_tropa}`);
                }}
                className="text-green-600 hover:underline text-sm"
              >
                ➕ Modificar
              </button>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate(`/tropa/informe/${tropa.id_tropa}`);
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                📄 Resumen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

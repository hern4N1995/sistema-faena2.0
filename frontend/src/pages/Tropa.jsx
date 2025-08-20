/*import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TropaForm from '../components/TropaForm.jsx';
import api from '../services/api.js';

export default function Tropa() {
  const [tropas, setTropas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/tropas') // ✅ Asegurate que el endpoint esté actualizado en el backend
      .then((res) => setTropas(res.data))
      .catch((err) => console.error('Error al obtener tropas:', err));
  }, []);

  const handleCreated = (nuevaTropa) => {
    setTropas((prev) => [...prev, nuevaTropa]);
    navigate(`/tropa/detalle/${nuevaTropa.id}`); // ✅ Ruta actualizada
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">
        🐄 Ingreso de Tropa 🐖
      </h2>

      <TropaForm onCreated={handleCreated} />

      <h3 className="text-xl font-semibold mt-10 mb-4">
        📋 Tropas registradas:
      </h3>
      <ul className="space-y-2">
        {tropas.map((tropa) => (
          <li
            key={tropa.id_tropa}
            className="bg-white p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{tropa.titular}</div>
              <div className="text-sm text-gray-600">
                Tropa Nº {tropa.n_tropa}
              </div>
              <div className="text-sm text-gray-600">DTE: {tropa.dte_dtu}</div>
            </div>
            <div className="text-sm text-gray-500">{tropa.fecha}</div>
            <button
              onClick={() => navigate(`/tropa/informe/${tropa.id_tropa}`)}
              className="text-blue-600 hover:underline text-sm"
            >
              Ver informe
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
*/
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
                Productor: {tropa.productor || '—'}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {tropa.fecha?.slice(0, 10)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/tropa/detalle/${tropa.id_tropa}`)}
                className="text-green-600 hover:underline text-sm"
              >
                ➕ Detalle
              </button>
              <button
                onClick={() => navigate(`/tropa/informe/${tropa.id_tropa}`)}
                className="text-blue-600 hover:underline text-sm"
              >
                📄 Informe
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

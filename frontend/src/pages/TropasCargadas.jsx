// TropasCargadas.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function TropasCargadas() {
  const [tropas, setTropas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/tropas')
      .then((res) => setTropas(res.data))
      .catch((err) => console.error('Error al obtener tropas:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          📋 Tropas cargadas
        </h1>

        {tropas.length === 0 ? (
          <p className="text-gray-500 text-center">
            No hay tropas registradas aún.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tropas.map((tropa) => (
              <li
                key={tropa.id_tropa}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between gap-3"
              >
                {/* Info principal */}
                <div>
                  <p className="font-semibold text-gray-800 text-base sm:text-lg">
                    Titular: {tropa.titular || '—'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tropa Nº {tropa.n_tropa} · DTE: {tropa.dte_dtu}
                  </p>
                  <p className="text-sm text-gray-600">
                    Productor: {tropa.productor_nombre || '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {tropa.fecha
                      ? new Date(tropa.fecha).toLocaleDateString('es-AR')
                      : '—'}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/modificar/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-green-600 hover:text-green-800 font-medium hover:underline text-sm"
                  >
                    ✏️ Modificar
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/resumen/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline text-sm"
                  >
                    📄 Resumen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

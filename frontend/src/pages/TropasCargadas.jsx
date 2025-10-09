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
      .then((res) => {
        const ordenadas = res.data.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setTropas(ordenadas.slice(0, 6));
      })
      .catch((err) => console.error('Error al obtener tropas:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-800 mb-2">
            📋 Tropas Cargadas
          </h1>
        </div>

        {tropas.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full mb-3">
              <span className="text-xl">🐄</span>
            </div>
            <p className="text-gray-500 text-lg">
              No hay tropas registradas aún
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Las tropas aparecerán aquí una vez cargadas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tropas.map((tropa) => (
              <div
                key={tropa.id_tropa}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 hover:border-green-200"
              >
                {/* Header con badge de fecha */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-green-700">
                      #{tropa.n_tropa}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {tropa.fecha
                        ? new Date(tropa.fecha).toLocaleDateString('es-AR')
                        : '—'}
                    </span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full group-hover:bg-green-500 transition-colors"></div>
                </div>

                {/* Información principal - MÁS COMPACTA */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-0.5">👤</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        Titular
                      </p>
                      <p className="text-gray-700 font-medium text-sm truncate">
                        {tropa.titular || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-0.5">🏭</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        Productor
                      </p>
                      <p className="text-gray-600 text-sm truncate">
                        {tropa.productor_nombre || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 text-sm mt-0.5">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        DTE/DTU
                      </p>
                      <p className="text-gray-600 font-mono text-xs truncate">
                        {tropa.dte_dtu}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones - MÁS COMPACTAS */}
                <div className="flex space-x-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/modificar/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                  >
                    <span className="text-sm">✏️</span>
                    <span className="text-sm">Modificar</span>
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      navigate(`/tropas-cargadas/resumen/${tropa.id_tropa}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium py-2.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-sm"
                  >
                    <span className="text-sm">📄</span>
                    <span className="text-sm">Resumen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer informativo - MÁS COMPACTO */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Mostrando las últimas 6 tropas registradas
          </p>
        </div>
      </div>
    </div>
  );
}

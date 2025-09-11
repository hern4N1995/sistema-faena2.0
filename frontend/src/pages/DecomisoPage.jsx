import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DecomisoPage = () => {
  const [faenas, setFaenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('/api/faena/realizadas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al obtener faenas');
        return r.json();
      })
      .then((data) => {
        setFaenas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar faenas:', err);
        setError('No se pudieron cargar las faenas');
        setLoading(false);
      });
  }, []);

  const handleDecomisar = (idFaena) => {
    navigate(`/decomiso/detalle/${idFaena}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">
        🧪 Faenas realizadas
      </h1>

      {loading ? (
        <p className="text-center text-slate-500">Cargando faenas...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : faenas.length === 0 ? (
        <p className="text-center text-slate-500">No hay faenas registradas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {faenas.map((f) => (
            <div
              key={f.id_faena}
              className="bg-white rounded-xl shadow p-4 border border-slate-200"
            >
              <p className="font-semibold text-green-800">
                Faena #{f.id_faena}
              </p>
              <p className="text-sm text-slate-600">Tropa: {f.n_tropa}</p>
              <p className="text-sm text-slate-600">
                Fecha: {new Date(f.fecha).toLocaleDateString('es-AR')}
              </p>
              <button
                onClick={() => handleDecomisar(f.id_faena)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                🧪 Decomisar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecomisoPage;

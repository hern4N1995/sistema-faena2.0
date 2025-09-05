import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FaenaPage = () => {
  const [tropas, setTropas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirigiendoId, setRedirigiendoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTropas = async () => {
      try {
        const res = await fetch('/api/faena/tropas');
        const data = await res.json();
        const ordenadas = data.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setTropas(ordenadas);
      } catch (err) {
        console.error('Error al cargar tropas', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTropas();
  }, []);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleFaenar = (t) => {
    setRedirigiendoId(t.id_tropa);
    const destino = t.id_faena
      ? `/faena/${t.id_faena}`
      : `/faena/nueva/${t.id_tropa}`;
    navigate(destino);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-slate-800">
          📋 Tropas a Faenar
        </h1>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      ) : tropas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-lg">No hay tropas cargadas aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200">
          <table className="min-w-[1000px] w-full text-sm text-left text-slate-700">
            <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">DTE/DTU</th>
                <th className="px-4 py-3">Guía Policial</th>
                <th className="px-4 py-3">Nº Tropa</th>
                <th className="px-4 py-3">Productor</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Titular Faena</th>
                <th className="px-4 py-3">Especie</th>
                <th className="px-4 py-3">Total tropa</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tropas.map((t) => (
                <tr
                  key={t.id_tropa}
                  className="bg-white border-b last:border-b-0 hover:bg-green-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {formatDate(t.fecha)}
                  </td>
                  <td className="px-4 py-3">{t.dte_dtu || '—'}</td>
                  <td className="px-4 py-3">{t.guia_policial || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-green-800">
                    {t.n_tropa || '—'}
                  </td>
                  <td className="px-4 py-3">{t.productor || '—'}</td>
                  <td className="px-4 py-3">{t.departamento || '—'}</td>
                  <td className="px-4 py-3">{t.titular_faena || '—'}</td>
                  <td className="px-4 py-3">{t.especie || '—'}</td>
                  <td className="px-4 py-3 font-semibold">
                    {t.total_a_faenar ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleFaenar(t)}
                        disabled={redirigiendoId === t.id_tropa}
                        className={`text-xs px-2 py-1 rounded font-semibold transition ${
                          redirigiendoId === t.id_tropa
                            ? 'bg-green-300 text-white cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {redirigiendoId === t.id_tropa
                          ? 'Redirigiendo...'
                          : 'Faenar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FaenaPage;

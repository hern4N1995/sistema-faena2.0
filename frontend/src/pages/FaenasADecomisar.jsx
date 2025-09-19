import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
};

const FaenasADecomisar = () => {
  const [faenas, setFaenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirigiendoId, setRedirigiendoId] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const fetchFaenas = async () => {
    try {
      const res = await fetch('/api/faenas-realizadas');
      const data = await res.json();
      const conFaenados = data.filter((f) => parseInt(f.total_faenado) > 0);
      const ordenadas = conFaenados.sort(
        (a, b) => new Date(b.fecha_faena) - new Date(a.fecha_faena)
      );
      setFaenas(ordenadas);
    } catch (err) {
      console.error('Error al cargar faenas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaenas();
  }, []);

  const formatDate = (f) => (f ? new Date(f).toLocaleDateString('es-AR') : '—');

  const handleDecomisar = (f) => {
    setRedirigiendoId(f.id_faena);
    navigate(`/decomisos/nuevo/${f.id_faena}`);
  };

  const FaenaCard = ({ f }) => (
    <div className="rounded-lg shadow-sm border p-3 mb-3 bg-white border-slate-200">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">
          {formatDate(f.fecha_faena)}
        </span>
        <span className="text-sm font-semibold text-green-800">
          Faena #{f.id_faena}
        </span>
      </div>
      <div className="text-sm text-slate-700 space-y-1">
        <p>
          <strong>DTE/DTU:</strong> {f.dte_dtu || '—'}
        </p>
        <p>
          <strong>Guía Policial:</strong> {f.guia_policial || '—'}
        </p>
        <p>
          <strong>Productor:</strong> {f.productor || '—'}
        </p>
        <p>
          <strong>Departamento:</strong> {f.departamento || '—'}
        </p>
        <p>
          <strong>Titular Faena:</strong> {f.titular_faena || '—'}
        </p>
        <p>
          <strong>Especie:</strong> {f.especie || '—'}
        </p>
        <p>
          <strong>Total faenado:</strong> {f.total_faenado ?? '—'}
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => handleDecomisar(f)}
          disabled={redirigiendoId === f.id_faena}
          className={`text-sm px-3 py-2 rounded font-semibold transition ${
            redirigiendoId === f.id_faena
              ? 'bg-green-300 text-white cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {redirigiendoId === f.id_faena ? 'Redirigiendo...' : 'Decomisar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center text-slate-800">
          🩺 Faenas a Decomisar
        </h1>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      ) : faenas.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <p className="text-base">No hay faenas con animales faenados.</p>
        </div>
      ) : isMobile ? (
        <div className="max-w-2xl mx-auto">
          {faenas.map((f) => (
            <FaenaCard key={f.id_faena} f={f} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow ring-1 ring-slate-200">
          <table className="min-w-[900px] w-full text-sm text-center text-slate-700">
            <thead className="bg-green-700 text-white uppercase tracking-wide text-xs">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">DTE/DTU</th>
                <th className="px-3 py-2">Guía Policial</th>
                <th className="px-3 py-2">Nº Tropa</th>
                <th className="px-3 py-2">Productor</th>
                <th className="px-3 py-2">Departamento</th>
                <th className="px-3 py-2">Titular Faena</th>
                <th className="px-3 py-2">Especie</th>
                <th className="px-3 py-2">Faenados</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {faenas.map((f) => (
                <tr
                  key={f.id_faena}
                  className="border-b last:border-b-0 bg-white hover:bg-green-50"
                >
                  <td className="px-3 py-2 text-center">
                    {formatDate(f.fecha_faena)}
                  </td>
                  <td className="px-3 py-2 text-center">{f.dte_dtu || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    {f.guia_policial || '—'}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold text-green-800">
                    {f.n_tropa || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {f.productor || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {f.departamento || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {f.titular_faena || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">{f.especie || '—'}</td>
                  <td className="px-3 py-2 text-center font-semibold">
                    {f.total_faenado ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDecomisar(f)}
                      disabled={redirigiendoId === f.id_faena}
                      className={`text-xs px-2 py-1 rounded font-semibold transition ${
                        redirigiendoId === f.id_faena
                          ? 'bg-green-300 text-white cursor-not-allowed'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {redirigiendoId === f.id_faena
                        ? 'Redirigiendo...'
                        : 'Decomisar'}
                    </button>
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

export default FaenasADecomisar;

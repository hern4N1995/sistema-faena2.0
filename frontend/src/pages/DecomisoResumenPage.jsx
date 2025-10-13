import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Hook para detectar si es móvil
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

const DecomisoResumenPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (!id) {
      setError('ID de decomiso no válido');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    fetch(`/api/decomisos/${id}/resumen`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener resumen');
        return res.json();
      })
      .then((data) => {
        setResumen(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error al cargar resumen:', err);
        setError('No se pudo cargar el resumen del decomiso');
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        ⏳ Cargando resumen...
      </div>
    );
  if (error)
    return (
      <p className="p-4 text-red-600 text-center font-semibold">❌ {error}</p>
    );
  if (resumen.length === 0)
    return (
      <p className="p-4 text-center text-slate-500">
        ⚠️ No se encontró información para este decomiso.
      </p>
    );

  const faena = resumen[0];

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:py-8 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-center text-slate-800 drop-shadow">
          📋 Resumen de Decomiso
        </h1>

        {/* Tarjetas de faena */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card title="N° de Tropa" value={faena.n_tropa || '—'} />
          <Card title="DTE / DTU" value={faena.dte_dtu || '—'} />
          <Card title="Fecha de Faena" value={formatFecha(faena.fecha_faena)} />
          <Card title="Faenados" value={faena.cantidad_faena || '—'} />
        </div>

        {/* Detalles del decomiso */}
        {isMobile ? (
          <div className="space-y-4">
            {resumen.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow border border-slate-200 p-4 text-sm text-slate-700 space-y-1"
              >
                <p>
                  <strong>Tipo:</strong> {r.nombre_tipo_parte || '—'}
                </p>
                <p>
                  <strong>Parte:</strong> {r.nombre_parte || '—'}
                </p>
                <p>
                  <strong>Afección:</strong> {r.afeccion || '—'}
                </p>
                <p>
                  <strong>Cantidad:</strong> {r.cantidad || '—'}
                </p>
                <p>
                  <strong>Peso (kg):</strong> {r.peso_kg || '—'}
                </p>
                <p>
                  <strong>Animales:</strong> {r.animales_afectados || '—'}
                </p>
                <p>
                  <strong>Destino:</strong> {r.destino_decomiso || '—'}
                </p>
                <p>
                  <strong>Observaciones:</strong> {r.observaciones || '—'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl shadow-xl border border-gray-100 bg-white overflow-x-auto">
            <table className="w-full text-sm text-center text-slate-700">
              <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Parte</th>
                  <th className="px-3 py-2">Afección</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Peso (kg)</th>
                  <th className="px-3 py-2">Animales</th>
                  <th className="px-3 py-2">Destino</th>
                  <th className="px-3 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-b-0 hover:bg-green-50"
                  >
                    <td className="px-3 py-2">{r.nombre_tipo_parte || '—'}</td>
                    <td className="px-3 py-2">{r.nombre_parte || '—'}</td>
                    <td className="px-3 py-2">{r.afeccion || '—'}</td>
                    <td className="px-3 py-2">{r.cantidad || '—'}</td>
                    <td className="px-3 py-2">{r.peso_kg || '—'}</td>
                    <td className="px-3 py-2">{r.animales_afectados || '—'}</td>
                    <td className="px-3 py-2">{r.destino_decomiso || '—'}</td>
                    <td className="px-3 py-2">{r.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Botón volver */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => navigate('/decomisos/cargados')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition shadow"
          >
            ⬅ Volver
          </button>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
    <p className="text-xs text-slate-500 mb-1">{title}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

export default DecomisoResumenPage;

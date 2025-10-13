import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DecomisoResumenPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
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

  const formatFecha = (fecha) => {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center mb-10 drop-shadow">
          📋 Resumen de Decomiso
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card title="N° de Tropa" value={faena.n_tropa || '—'} />
          <Card title="DTE / DTU" value={faena.dte_dtu || '—'} />
          <Card title="Fecha de Faena" value={formatFecha(faena.fecha_faena)} />
          <Card title="Faenados" value={faena.cantidad_faena || '—'} />
        </div>

        <div className="overflow-x-auto rounded-xl shadow ring-1 ring-slate-200">
          <table className="min-w-[800px] w-full text-sm text-center text-slate-700 bg-white">
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

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate('/decomisos/cargados')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-semibold transition"
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

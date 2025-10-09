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

  if (loading) return <p className="p-4">⏳ Cargando resumen...</p>;
  if (error) return <p className="p-4 text-red-600">❌ {error}</p>;
  if (resumen.length === 0)
    return (
      <p className="p-4">⚠️ No se encontró información para este decomiso.</p>
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
    <div className="max-w-5xl mx-auto p-4 px-4 sm:py-8 py-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center mb-10 drop-shadow">
        📋 Resumen
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card title="N° de Tropa" value={faena.n_tropa || '—'} />
        <Card title="DTE / DTU" value={faena.dte_dtu || '—'} />
        <Card title="Fecha de Faena" value={formatFecha(faena.fecha_faena)} />
        <Card title="Faenados" value={faena.cantidad_faena || '—'} />
      </div>

      <table className="w-full text-sm bg-white rounded shadow">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-2 py-2">Tipo</th>
            <th className="px-2 py-2">Parte</th>
            <th className="px-2 py-2">Afección</th>
            <th className="px-2 py-2 text-center">Cantidad</th>
            <th className="px-2 py-2 text-center">Peso (kg)</th>
            <th className="px-2 py-2 text-center">Animales</th>
            <th className="px-2 py-2">Destino</th>
            <th className="px-2 py-2">Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {resumen.map((r, i) => (
            <tr key={i} className="border-b">
              <td className="px-2 py-2">{r.nombre_tipo_parte || '—'}</td>
              <td className="px-2 py-2">{r.nombre_parte || '—'}</td>
              <td className="px-2 py-2">{r.afeccion || '—'}</td>
              <td className="px-2 py-2 text-center">{r.cantidad || '—'}</td>
              <td className="px-2 py-2 text-center">{r.peso_kg || '—'}</td>
              <td className="px-2 py-2 text-center">
                {r.animales_afectados || '—'}
              </td>
              <td className="px-2 py-2">{r.destino_decomiso || '—'}</td>
              <td className="px-2 py-2">{r.observaciones || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate('/decomisos/cargados')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ⬅ Volver
        </button>
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

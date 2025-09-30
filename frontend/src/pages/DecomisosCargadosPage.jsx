import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DecomisosCargadosPage = () => {
  const [decomisos, setDecomisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No hay token disponible. Iniciá sesión nuevamente.');
      setLoading(false);
      return;
    }

    fetch('/api/decomisos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener decomisos');
        return res.json();
      })
      .then((data) => {
        setDecomisos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error al cargar decomisos:', err);
        setError('No se pudo cargar la lista de decomisos');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">⏳ Cargando decomisos...</p>;
  if (error) return <p className="p-4 text-red-600">❌ {error}</p>;
  if (decomisos.length === 0)
    return <p className="p-4">⚠️ No hay decomisos cargados.</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 overflow-x-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        📦 Decomisos Cargados
      </h1>

      <table className="w-full text-sm bg-white rounded shadow table-fixed">
        <thead className="bg-slate-700 text-white">
          <tr>
            <th className="w-32 px-2 py-2 text-center">Fecha Faena</th>
            <th className="w-24 px-2 py-2 text-center">N° Tropa</th>
            <th className="w-32 px-2 py-2 text-center">DTE / DTU</th>
            <th className="w-24 px-2 py-2 text-center">Cant. Tropa</th>
            <th className="w-24 px-2 py-2 text-center">Faenados</th>
            <th className="w-24 px-2 py-2 text-center">Decomisados</th>
            <th className="w-32 px-2 py-2 text-center">Resumen</th>
          </tr>
        </thead>
        <tbody>
          {decomisos.map((d) => (
            <tr key={d.id_decomiso} className="border-b">
              <td className="px-2 py-2 text-center">
                {formatFecha(d.fecha_faena)}
              </td>
              <td className="px-2 py-2 text-center">{d.n_tropa}</td>
              <td className="px-2 py-2 text-center truncate">{d.dte_dtu}</td>
              <td className="px-2 py-2 text-center">{d.cantidad_tropa}</td>
              <td className="px-2 py-2 text-center">{d.cantidad_faena}</td>
              <td className="px-2 py-2 text-center">{d.cantidad_decomisada}</td>
              <td className="px-2 py-2 text-center">
                <button
                  onClick={() =>
                    navigate(`/decomisos/detalle/${d.id_decomiso}`)
                  }
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                >
                  Ver resumen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatFecha = (fecha) => {
  const f = new Date(fecha);
  return f.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default DecomisosCargadosPage;

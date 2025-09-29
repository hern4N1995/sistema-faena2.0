import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import DetalleEspecieForm from '../components/DetalleEspecieForm';

export default function DetalleTropa() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tropaInfo, setTropaInfo] = useState({
    numero_tropa: '',
    fecha: '',
    dte: '',
    titular: '',
    productor: '',
    planta: '',
  });

  // detalle siempre con categorias como array para evitar errores al map/reduce
  const [detalle, setDetalle] = useState({ especie: '', categorias: [] });
  const [especies, setEspecies] = useState([]);

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchTropa = async () => {
    try {
      const res = await api.get(`/tropas/${id}`, {
        headers: getTokenHeaders(),
      });
      const { n_tropa, dte_dtu, fecha, titular, planta, productor } =
        res.data || {};

      setTropaInfo({
        numero_tropa: n_tropa || '',
        dte: dte_dtu || '',
        fecha: fecha || '',
        titular: titular || '',
        planta: planta || '',
        productor: productor || '',
      });
    } catch (err) {
      console.error('Error al obtener tropa:', err);
      setError('No se pudo obtener la tropa');
      setTropaInfo((prev) => ({ ...prev }));
    }
  };

  const fetchDetalleAgrupado = async () => {
    try {
      const res = await api.get(`/tropas/${id}/detalle-agrupado`, {
        headers: getTokenHeaders(),
      });
      const data = res.data || {};
      setDetalle({
        especie: data.especie ?? '',
        categorias: Array.isArray(data.categorias) ? data.categorias : [],
      });
    } catch (err) {
      console.error('Error al obtener detalle agrupado:', err);
      setDetalle({ especie: '', categorias: [] });
      setError((prev) => prev || 'No se pudo cargar el detalle de la tropa');
    }
  };

  const fetchEspecies = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.get('/especies', { headers });
      const data = res.data;
      // filtrado adicional por seguridad si la API devolviera algo inesperado
      const activos = Array.isArray(data)
        ? data.filter((e) =>
            e.estado === undefined ? true : Boolean(e.estado)
          )
        : [];
      setEspecies(activos);
    } catch (err) {
      console.error('Error al obtener especies:', err);
      setEspecies([]);
      setError((prev) => prev || 'No se pudieron cargar las especies');
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      await Promise.all([
        fetchTropa(),
        fetchDetalleAgrupado(),
        fetchEspecies(),
      ]);
      if (mounted) setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const { especie, categorias } = detalle;
  const totalEspecie = Array.isArray(categorias)
    ? categorias.reduce((acc, i) => acc + (Number(i.remanente) || 0), 0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando detalle de tropa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
          Detalle de Tropa
        </h1>

        {/* Planta */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={tropaInfo.planta?.nombre ?? tropaInfo.planta ?? ''}
            disabled
            className="text-lg sm:text-xl font-semibold text-center bg-gray-50 border-none rounded-lg px-4 py-2 w-full max-w-xs"
          />
        </div>

        {/* Productor */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Productor
          </label>
          <input
            type="text"
            value={tropaInfo.productor || ''}
            disabled
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-800"
          />
        </div>

        {/* Datos de la tropa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Nº Tropa', value: tropaInfo.numero_tropa },
            { label: 'Fecha', value: tropaInfo.fecha?.split('T')[0] || '' },
            { label: 'DTE/DTU', value: tropaInfo.dte },
            { label: 'Titular', value: tropaInfo.titular },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                {label}
              </label>
              <input
                type="text"
                value={value || ''}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-800"
              />
            </div>
          ))}
        </div>

        {/* Resumen visual */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Animales cargados
          </h2>
          {!Array.isArray(categorias) || categorias.length === 0 ? (
            <p className="text-gray-500 text-center">
              No se han registrado animales en esta tropa.
            </p>
          ) : (
            <>
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                {especie}
              </h3>

              {/* Móvil */}
              <div className="sm:hidden space-y-2">
                {categorias.map((item) => (
                  <div
                    key={item.id ?? item.nombre ?? JSON.stringify(item)}
                    className="bg-gray-50 rounded-lg shadow p-3 flex justify-between items-center"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {item.nombre ?? item.descripcion ?? ''}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.remanente ?? 0}
                    </span>
                  </div>
                ))}
                <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center font-bold text-sm">
                  <span>TOTAL {especie}</span>
                  <span>{totalEspecie}</span>
                </div>
              </div>

              {/* Escritorio */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Categoría
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Cantidad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((item) => (
                      <tr
                        key={item.id ?? item.nombre ?? JSON.stringify(item)}
                        className="border-t border-gray-200"
                      >
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {item.nombre ?? item.descripcion ?? ''}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                          {item.remanente ?? 0}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold text-sm">
                      <td className="px-4 py-2">TOTAL {especie}</td>
                      <td className="px-4 py-2 text-right">{totalEspecie}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Formulario de especies: le pasamos especies para poblar el desplegable */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Cargar Detalle por Especie
          </h2>
          <DetalleEspecieForm
            idTropa={id}
            onSave={fetchDetalleAgrupado}
            especies={especies} // <-- importante: pasamos la lista de especies
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

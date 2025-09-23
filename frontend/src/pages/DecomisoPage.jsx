import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DecomisoPage = () => {
  const { id_faena } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState([]);
  const [decomisos, setDecomisos] = useState({});
  const [infoFaena, setInfoFaena] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await fetch(`/api/faena/${id_faena}/decomiso-datos`);
        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error('Error al cargar datos de faena:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [id_faena]);

  const handleChange = (id_tropa_detalle, value) => {
    setDecomisos((prev) => ({
      ...prev,
      [id_tropa_detalle]: value,
    }));
  };

  const handleGuardar = async () => {
    const payload = Object.entries(decomisos).map(
      ([id_tropa_detalle, cantidad]) => ({
        id_faena,
        id_tropa_detalle,
        cantidad: parseInt(cantidad, 10),
      })
    );

    try {
      const res = await fetch('/api/decomisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const id_decomiso = data.id_decomiso;

      const resInfo = await fetch(`/api/decomiso/${id_decomiso}/info-faena`);
      const info = await resInfo.json();
      setInfoFaena(info);

      alert('Decomisos registrados correctamente');

      setTimeout(() => {
        navigate(`/decomiso/enfermedades/${id_decomiso}`);
      }, 1000);
    } catch (err) {
      console.error('Error al guardar decomisos:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {' '}
        {/* <-- mismo ancho que header/footer */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          🩺 Registrar Decomisos
        </h1>
        {infoFaena && (
          <div className="mb-4 bg-white rounded-lg shadow p-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Fecha</p>
              <p className="font-semibold">{infoFaena.fecha_faena}</p>
            </div>
            <div>
              <p className="text-gray-500">DTE/DTU</p>
              <p className="font-semibold">{infoFaena.dte_dtu}</p>
            </div>
            <div>
              <p className="text-gray-500">Tropa</p>
              <p className="font-semibold">{infoFaena.n_tropa}</p>
            </div>
          </div>
        )}
        {loading ? (
          <p className="text-center text-sm text-gray-500">Cargando...</p>
        ) : datos.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Sin datos.</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-2 py-2 text-left">Especie</th>
                    <th className="px-2 py-2 text-left">Categoría</th>
                    <th className="px-2 py-2 text-center">Faenados</th>
                    <th className="px-2 py-2 text-center">Decomisar</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.map((d) => (
                    <tr key={d.id_tropa_detalle} className="border-b">
                      <td className="px-2 py-2">{d.especie}</td>
                      <td className="px-2 py-2">{d.categoria}</td>
                      <td className="px-2 py-2 text-center font-bold">
                        {d.faenados}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max={d.faenados}
                          value={decomisos[d.id_tropa_detalle] || ''}
                          onChange={(e) =>
                            handleChange(d.id_tropa_detalle, e.target.value)
                          }
                          className="w-16 border border-gray-300 rounded px-1 py-1 text-center text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGuardar}
                className="px-4 py-2 bg-green-700 text-white rounded text-sm font-semibold hover:bg-green-800"
              >
                Guardar Decomisos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecomisoPage;

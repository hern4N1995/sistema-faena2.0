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

      // ✅ Cargar info de faena antes de redirigir
      const resInfo = await fetch(`/api/decomiso/${id_decomiso}/info-faena`);
      const info = await resInfo.json();
      setInfoFaena(info);

      alert('Decomisos registrados correctamente');

      // ⏳ Esperar 1 segundo para que se vea la info antes de redirigir
      setTimeout(() => {
        navigate(`/decomiso/enfermedades/${id_decomiso}`);
      }, 1000);
    } catch (err) {
      console.error('Error al guardar decomisos:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        🩺 Registrar Decomisos
      </h1>

      {infoFaena && (
        <div className="max-w-3xl mx-auto mb-6 bg-gray-100 p-4 rounded ring-1 ring-gray-300">
          <p>
            <strong>Fecha de Faena:</strong> {infoFaena.fecha_faena}
          </p>
          <p>
            <strong>DTE/DTU:</strong> {infoFaena.dte_dtu}
          </p>
          <p>
            <strong>N° Tropa:</strong> {infoFaena.n_tropa}
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Cargando datos...</p>
      ) : datos.length === 0 ? (
        <p className="text-center text-gray-500">
          No hay animales faenados en esta faena.
        </p>
      ) : (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 ring-1 ring-gray-200">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-green-700 text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-2">Especie</th>
                <th className="px-4 py-2">Categoría</th>
                <th className="px-4 py-2">Faenados</th>
                <th className="px-4 py-2">A Decomisar</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr
                  key={d.id_tropa_detalle}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-2">{d.especie}</td>
                  <td className="px-4 py-2">{d.categoria}</td>
                  <td className="px-4 py-2 font-bold">{d.faenados}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      max={d.faenados}
                      value={decomisos[d.id_tropa_detalle] || ''}
                      onChange={(e) =>
                        handleChange(d.id_tropa_detalle, e.target.value)
                      }
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 text-right">
            <button
              onClick={handleGuardar}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 font-semibold"
            >
              Guardar Decomisos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecomisoPage;
